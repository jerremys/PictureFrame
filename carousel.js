$( document ).ready(function(){
        // Make the first frame active
        $("#carousel iframe:first").addClass('active');
        const apiKey = "cf076ec986dbdb91b88d82c341b3baaa";
        const zip = 63144;
        const pageTime = 23000;
        const DIRECTION = {
            "FORWARD" : 0,
            "BACKWARD" : 1,
            "FIRST" : 2,
			"WEATHER" : 3
          };
        let paused = false, timer, nightClosed = false;
        window.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if(data.event === "command"){
              if(data.func == "weather"){
                console.log("Got weather update", data);
                updateWeather(data.args);
              }
            }
          }, false);

        const subscribeToWeather = function(){
            const resp = $("#weather-frame")[0].contentWindow.postMessage('{"event":"command","func":"subscribe","args":""}', '*');
        };

        const pauseFrame = function(iframe){
            iframe.contentWindow.postMessage('{"event":"command","func":"pause","args":""}', '*');
        };

        const playFrame = function(iframe){
            iframe.contentWindow.postMessage('{"event":"command","func":"play","args":""}', '*');
        };

        const setMoonPhase = function(data){
            document.getElementById("moon-phase").contentWindow.postMessage('{"event":"command","func":"phase","args":' + data + '}', '*');
        };

        const updateWeather = function (data) {
            $('#temperature-val').text(Math.trunc(data.temp));
            setMoonPhase(data.moon_phase);
        };

        async function nextFrame(direction){
            const $activeFrame = $('#carousel .active');
            let $nextFrame;

            if(direction == DIRECTION.BACKWARD){
                $nextFrame = $activeFrame.prev('iframe');
                if(!$nextFrame.length){
                    $nextFrame = $("#carousel iframe:last");
                }
            } else if(direction == DIRECTION.FIRST){
                $nextFrame = $("#carousel iframe:first");
            } else if(direction == DIRECTION.WEATHER){
                $nextFrame = $("#carousel iframe.weather");
            } else{
                $nextFrame = $activeFrame.next('iframe');
                if(!$nextFrame.length){
                    $nextFrame = $("#carousel iframe:first");
                }
            }

            if($nextFrame.data("playable") === true){
                playFrame($nextFrame[0]);

                if($nextFrame.data("youtube") === true){
                    await sleep(700);
                }
            }

            $activeFrame.addClass('previous');
            $nextFrame.addClass('active');

            setTimeout(function(){
                $activeFrame.removeClass('previous active');
                if($activeFrame.data("playable") === true){
                    pauseFrame($activeFrame[0]);
                }
            }, 800);
        }

        const sleep = function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          };

        const togglePause = function(){
            paused = !paused;
            $('body').toggleClass("paused", paused);
        };

        const startInterval = function(){
            timer = window.setInterval(function(){
                if(paused){
                    return;
                }
                nextFrame(DIRECTION.FORWARD);
            }, pageTime);
		};


        $("#overlay").on('click', togglePause).on('touchend', togglePause).swipe(
            function(direction) {
                clearInterval(timer);
                if(direction == 'left'){
                    nextFrame(DIRECTION.FORWARD);
                }else if(direction == 'right'){
                    nextFrame(DIRECTION.BACKWARD);
                }else if(direction == 'up'){
                    nextFrame(DIRECTION.FIRST);
                }else{
                    nextFrame(DIRECTION.WEATHER);
				}
                startInterval();
            },
            {
                preventDefault: true,
                mouse: true,
                pen: true,
                distance: 100
            });

        startInterval();

        // Wait a bit for the page to load
        setTimeout(subscribeToWeather, 5000);
    }
);

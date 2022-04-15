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

        const pauseYoutube = function(iframe){
            iframe.contentWindow.postMessage('{"event":"command","func":"pause","args":""}', '*');
        };

        const playYoutube = function(iframe){
            iframe.contentWindow.postMessage('{"event":"command","func":"play","args":""}', '*');
        };

        const updateClock = function(first){
            const now = new Date();
            const hours = (new Date()).getHours();
            const minutes = (new Date()).getMinutes();
            $('#clock').text((hours > 12 ? hours - 12 : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes));
        };

        const setMoonPhase = function(data){
            document.getElementById("moon-phase").contentWindow.postMessage('{"event":"command","func":"phase","args":' + data + '}', '*');
        }

        const updateWeather = function (data) {
            $('#temperature-val').text(Math.trunc(data.temp));
            setMoonPhase(data.moon_phase);
        };

        const updateFooter = function($frame){
            $("body").toggleClass('clock', $frame.data('clock') == true).toggleClass('temp', $frame.data('temp') == true);
        }

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
                playYoutube($nextFrame[0]);

                if($nextFrame.data("youtube") === true){
                    await sleep(700);
                }
            }

            updateFooter($nextFrame);

            $activeFrame.addClass('previous');
            $nextFrame.addClass('active');

            setTimeout(function(){
                $activeFrame.removeClass('previous active');
                if($activeFrame.data("playable") === true){
                    pauseYoutube($activeFrame[0]);
                }
            }, 800);


        };

        const sleep = function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          };

        const togglePause = function(){
            paused = !paused;
            $('body').toggleClass("paused", paused);
        }

        const startInterval = function(){
            timer = window.setInterval(function(){
                if(paused){
                    return;
                }
                nextFrame(DIRECTION.FORWARD);
            }, pageTime)
			
			var now = new Date();
			var remainingMs = ((60 - (new Date()).getSeconds()) * 1000) + 100;
			
			// Wait until the top of the minute to start updating the clock then update it every 60 seconds
			setTimeout(function() {
				window.setInterval(updateClock, 60000);
			}, remainingMs);
			
			console.log('Will start timer in: ' + remainingMs);
			
			// reload every morning at 0600
			var millisTill = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 6, 0, 0, 0) - now;
			setTimeout(window.location.reload, millisTill);
			console.log('Will reload in: ' + millisTill);

		}


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

        updateFooter($("iframe.active"));
        startInterval();
        updateClock(true);

        // Wait a bit for the page to load
        setTimeout(subscribeToWeather, 5000);
    }
)

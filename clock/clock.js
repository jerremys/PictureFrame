'use strict';

var clock = {
    randomTheme: function (){
        const themes = ['color0', 'color1', 'color2', 'color3', 'color4', 'color6'];
        const nextTheme = Math.floor(Math.random() * themes.length);

        const clock = document.querySelector("clock.flip");
        for(let i = themes.length - 1; i >= 0; i--){
            clock.classList.remove(themes[i]);
        }
        clock.classList.add(themes[nextTheme]);
    },
    startTime: function () {
        const today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();

        var fadeClock = document.querySelector("clock.fade");

        if (fadeClock) {
            clock.setFadeClock(fadeClock, "hour", h);
            clock.setFadeClock(fadeClock, "minute", m);
            //clock.setFadeClock(fadeClock, "seconds", s);
        }

        var flipClock = document.querySelector("clock.flip");

        if (flipClock) {
            clock.setFlipClock(flipClock, "hour", h);
            clock.setFlipClock(flipClock, "minute", m);
            //clock.setFlipClock(flipClock, "minute", s);
        }

        setTimeout(clock.startTime, 10000);
    },
    setFlipClock: function (clock, tag, value) {
        var newT1, newT2, hours12;
		
        var time1 = clock.querySelector("." + tag + "1");
        var time2 = clock.querySelector("." + tag + "2");

        if (tag == 'hour') {
            var temp =value % 12 || 12;
            newT1 = Math.floor(temp / 10);
            newT2 = temp < 10 ? temp : temp - 10;

            var meridiem = clock.querySelector(".meridiem");
            
            if(value >=12 && !meridiem.classList.contains('pm')){
                meridiem.classList.remove("am") 
                meridiem.classList.add("pm") 
            }else if(value < 12 && !meridiem.classList.contains('am')){
                meridiem.classList.remove("pm") 
                meridiem.classList.add("am") 
            }

        } if (tag == 'minute') {
            newT1 = Math.floor(value / 10);
            newT2 = value % 10;
        }

        [[time1, newT1], [time2, newT2]].forEach(
            el =>{
                var timeEl = el[0];
                var timeVal = el[1];

                var top = timeEl.querySelector(".top");
                var bottom = timeEl.querySelector(".bottom");
                var flipFront = timeEl.querySelector(".flip-card-front");
                var flipBack = timeEl.querySelector(".flip-card-back");
                var flipCard2 = timeEl.querySelector(".flip-card");
                var currentTime = top.innerText;

                if (currentTime != timeVal) {
                    currentTime = top.innerText;
                    flipFront.textContent = currentTime;
    
                    flipBack.textContent = timeVal;
                    top.textContent = timeVal;
    
                    flipCard2.classList.add("flip");
                    setTimeout(function () {
                        bottom.textContent = timeVal;
                        flipCard2.classList.add("reset");
                        flipCard2.classList.remove("flip");
                        setTimeout(function () {
                            flipCard2.classList.remove("reset");
                        }, 20);
                    }, 600);
                }
            }
        )

    },

    setFadeClock: function (clock, tag, value) {
        var t1 = clock.querySelector(tag + ">first span:not(.active)"),
            t2 = clock.querySelector(tag + ">second span:not(.active)"),
            t1Active = clock.querySelector(tag + ">first span.active"),
            t2Active = clock.querySelector(tag + ">second span.active");

        var newT1, newT2 = 0, isPm;

        if (tag == "hour") {
			isPm = value >= 13;
            var temp =value % 12 || 12;
            newT1 = Math.floor(temp / 10);
            newT2 = temp < 10 ? temp : temp - 10;
        } else {
            newT1 = Math.floor(value / 10);
            newT2 = value % 10;
        }

        if ((tag != 'hour' && t1.innerText == '') || t1.innerText != newT1) {
            t1.innerHTML = newT1;
            t1.classList.add("active");
            t1Active.classList.remove("active");
            clock.querySelector(tag + ">first").classList.remove("hidden") ;

		}else if (tag == 'hour' && newT1 == '') {
            let sdafds = clock.querySelector(tag + ">first");
            clock.querySelector(tag + ">first").classList.add("hidden") ;
        }

        if (t2.innerText == '' || t2.innerText != newT2) {
            t2.innerHTML = newT2;
            t2.classList.add("active");
            t2Active.classList.remove("active");

            if(tag == 'hour'){
                var meridiem = clock.querySelector(".meridiem");
                if(value >=12){
                    meridiem.classList.remove("am");
                    meridiem.classList.add("pm") ;
                }else {
                    meridiem.classList.remove("pm");
                    meridiem.classList.add("am");
                }
            }
		}
    }


};

clock.startTime();
setInterval(clock.randomTheme, 300000); //5 minutes

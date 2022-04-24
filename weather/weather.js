var weatherCard = {
  apiKey: "cf076ec986dbdb91b88d82c341b3baaa",
  lat: 38.615338631871516,
  lon: -90.35343306524707,
  conditions: ['thunderstorm', 'drizzle', 'rain', 'snow', 'clear', 'clouds'],
  color2: "#9e2f28", //temp point & PoP fill
  color1: "#110d0e", //temp line & range
  colorTextAxis: "rgba(0, 0, 0, 0.6)",
  refreshMs:  5 * 60 * 1000,
  data: null,
  subscriber: null,
  setup: function () {
    var t = weatherCard;
    t.getWeather();
    setInterval(t.getWeather, t.refreshMs);
  },
  setDayNight: function(sunrise, sunset){
    const now = Math.trunc((new Date()).getTime()/1000), $body = $("body");
    const isNight = now > sunset || now < sunrise;

    Math.trunc(1643226238000/1000)
    $body.toggleClass("night", isNight).toggleClass("day", !isNight);
  },
  getWeather: function () {
    var t = weatherCard;
    var jqxhr = $.getJSON("https://api.openweathermap.org/data/2.5/onecall?", {
      lat: t.lat,
      lon: t.lon,
      appid: t.apiKey,
      exclude: "minutely",
      units: "imperial"
    }).done(function (data, status) {
        t.data = {'temp': data.current.temp, 'moon_phase': data.daily[0].moon_phase};
        t.setDayNight(data.current.sunrise, data.current.sunset);
        t.setWeatherHourly(data.hourly);
        t.setWeatherDaily(data.daily);
        t.setWeatherCurrent(data.current);
        t.publishWeather(t.data);
      })
  },
  publishWeather : function(data){
    if(weatherCard.subscriber){
      console.log("Publish weather update", weatherCard.subscriber);

      weatherCard.subscriber.postMessage('{"event":"command","func":"weather","args":' + JSON.stringify(data) + '}', '*');
    }
  },
  setWeatherCurrent : function(data){
    var $body = $("body");
    $("#currentTemp .val").text(Math.round(data.temp));
    $("#currentFeels .val").text(Math.round(data.feels_like));
    $("#currentHumidity .val").text(data.humidity);
    $("#currentDesc .val").text(data.weather[0].main);
    var currentCondition = data.weather[0].main.toLowerCase();
    $body.removeClass(weatherCard.conditions);

    if(weatherCard.conditions.indexOf(currentCondition) != -1){
      $body.addClass(currentCondition);
      $("#text-description").hide();
    }else{
      $("#text-description").show();
      $("#text-description .main").text(data.weather[0].main);
      $("#text-description .details").text(data.weather[0].description);
    }
  },
  setWeatherHourly: function (data) {
    datapoints = [];
    
    for (var i = 0; i < 13 && i < data.length; i++) {
      var element = data[i];
      var d = new Date();
      d.setTime(element.dt * 1000);

      datapoints.push({
        x: d,
        y: Math.round(element.temp),
        pop: (element.pop > 0 ? + Math.round(element.pop* 100) + '%' : ''),
        name: element.weather[0].icon,
        indexLabelMaxWidth: '35',
        indexLabelTextAlign: 'center',
        indexLabel: Math.round(element.temp) + '°'
      });
    };

    chart = new CanvasJS.Chart("hourlyChartContainer", {
      backgroundColor: 'rgba(255,255,255,0.3)',
      animationEnabled: true,
      title:{
        text: "⠀"   
      },
      toolTip:{
        enabled: false,
      },
      axisX: {
        interval: 1,
        intervalType: "hour",
        valueFormatString: "h T",
        labelFontColor: weatherCard.colorTextAxis // Time
      },
      axisY:{
        valueFormatString: "#0 °F",
        labelFontColor: weatherCard.colorTextAxis, //Degrees
        labelFontSize: 14,
        includeZero: false,
        stripLines: [{
          color: "#000099", // Freezing
          lineDashType : "dash",
          value: 32
        }]
      },
      data: [{        
        type: "line",
        indexLabelFontSize: 16,
        indexLabelFontColor: weatherCard.colorTextAxis,
        markerColor: weatherCard.color1,
        lineColor: weatherCard.color2,
        markerSize: 8,
        dataPoints: datapoints
      }]
    });
  
    chart.render();
    weatherCard.addImages(chart, 0);
  },
  setWeatherDaily: function (data){
    var datapoints = [];
    var datapointsPop = [];
    var dayName = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
    for(var i = 0, j = data.length; i < j; i++){
      var element = data[i];
      var d = new Date();
      d.setTime(element.dt * 1000);
      datapoints.push({
        label: dayName[d.getDay()],
        indexLabelFontColor: weatherCard.colorTextAxis,
        y: [Math.round(element.temp.min), Math.round(element.temp.max)],
        name: element.weather[0].icon
      });

      datapointsPop.push({
        label: dayName[d.getDay()],
        y: element.pop * 100
      })
    }

    var chart = new CanvasJS.Chart("dailyChartContainer", {
      backgroundColor: 'rgba(255,255,255,0.3)',
      animationEnabled: true,
      title:{
        text: "⠀"              
      },
      toolTip:{
        enabled: false,
      },
      axisX: {
				labelFontColor: weatherCard.colorTextAxis //days
			},
      axisY: {
        suffix: " °F",
        gridThickness: 0,
        labelFontColor: weatherCard.colorTextAxis, //degrees axis
        labelFontSize: 14,
        stripLines: [{
          color: "#000099", // Freezing
          lineDashType : "dash",
          value: 32
        }]
      },
      axisY2: {
        includeZero: false,
        titleFontColor: weatherCard.color1,
        lineColor: weatherCard.color1,
        labelFontColor: weatherCard.color1, // PoP percent
        maximum: 100,
        minimum: 0,
        suffix: "%"
      },
      data: [{
        type: "splineArea",
        includeZero: false,
        name: "pop",
        axisYType: "secondary",
        showInLegend: false,
        yValueFormatString: "###%",
        fillOpacity: 0.2,
        color: weatherCard.color1, //Temp range fill
        dataPoints: datapointsPop //Precip range
      },{
        type: "rangeSplineArea",
        fillOpacity: 0.6,
        color: weatherCard.color2, //PoP range fill
        indexLabelFormatter: formatter,
        indexLabelFontSize: 14,
        dataPoints: datapoints
      }
      ]
    });
    chart.render();
    weatherCard.addImages(chart, 1);
  },
  makeItRain : function() {
    var increment = 0;
    var drops = "";
    var backDrops = "";
  
    while (increment < 50) {
      //couple random numbers to use for various randomizations
      //random number between 98 and 1
      var randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
      //random number between 5 and 2
      var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
      //increment
      increment += randoFiver;
      //add in a new raindrop with various randomizations to certain CSS properties
      drops += '<div class="drop" style="left: ' + ((increment * 2) - 7) + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 1.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"></div></div>';
      backDrops += '<div class="drop" style="right: ' + ((increment * 2) - 7) + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 1.' + randoHundo + 's; animation-duration: 1.5' + randoHundo + 's;"></div></div>';
    }
  
    $('.rain.front-row').append(drops);
    $('.rain.back-row').append(backDrops);
  },
  addImages: function(chart, dataIndex) {
    var $container = $(chart.container);
  
    var $cont = $('<div id="weather-icons">');
    $cont.appendTo($('.canvasjs-chart-container', $container));
  
    for(var i = 0; i < chart.data[dataIndex].dataPoints.length; i++){
      const dp = chart.data[dataIndex].dataPoints[i];
      var dpsName = dp.name;
      var pop = dp.pop ? '<div class="pop">' + dp.pop + '</pop>' : '';
      $cont.append('<div><img src="http://openweathermap.org/img/wn/' + dpsName + '.png" class="' + dpsName + '">' + pop + '</div>');
    }
  }
};
function formatter(e) { 
		return e.dataPoint.y[e.index] + "°";
} 

$(function () {
  const t = weatherCard;
  t.setup();
  t.makeItRain();
  window.addEventListener("message", (event) => {
    console.log("Got weather subscribe request", event);
    t.subscriber = event.source;

    if(t.data){
      weatherCard.publishWeather(t.data);
    }
  }, false);
});

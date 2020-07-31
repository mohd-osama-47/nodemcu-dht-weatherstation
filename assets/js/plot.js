 //Verification keys for my firebase realtime database
 const config = {
     apiKey: "<GET FROM YOUR CONSOLE>",
     authDomain: "<GET FROM YOUR CONSOLE>.firebaseapp.com",
     databaseURL: "https://<GET FROM YOUR CONSOLE>.firebaseio.com",
     projectId: "<GET FROM YOUR CONSOLE>",
     storageBucket: "<GET FROM YOUR CONSOLE>.appspot.com",
     messagingSenderId: "<GET FROM YOUR CONSOLE>",
     appId: "<GET FROM YOUR CONSOLE>",
     measurementId: "<GET FROM YOUR CONSOLE>"
 };

 firebase.initializeApp(config);


 function counter() {
     var measurements = document.getElementById("measure-count").value;
     var int_measurements;

	//if the text box is empty, assume last 200 data entry points only.
     if (measurements == 0) { int_measurements = 200 } else { int_measurements = parseInt(measurements) }


     firebase.database().ref('Stampped DHT').limitToLast(int_measurements).on('value', ts_measures => {

         let timestamps = [];
         let tvalues = [];
         let hvalues = [];


         ts_measures.forEach(ts_measure => {
             //for some reason, NodeMCU code sometimes bugs out and sends an old date
             //A value of 1000000000 cooresponds to the year 2001
             if (ts_measure.val().Time < 1000000000) { return; }

             //The structure of my stampped DHT data is as follows:
             //'Stammped DHT':
             //             |>'Push ID':
             //                       |>Temperature:
             //                       |>Humidity:
             //                       |>Time:

             //for each value in the 'ts_measures' object, I am pushing formatted UTC stamps,
             //Temperature readings, and humiditey readings to their respective arrays.
             timestamps.push(moment.unix(ts_measure.val().Time).utcOffset(0).format());
             tvalues.push(ts_measure.val().Temperature);
             hvalues.push(ts_measure.val().Humidity);
         });

         //using plotly.js for real time plotting purposes 
         myPlotDiv1 = document.getElementById('temp');

         // generate x and y data necessited by Plotly.js to draw the plot
         const tdata = {
             x: timestamps,
             y: tvalues,
             type: 'scatter',
             name: '°C Temperature',
             mode: 'lines+markers',
             marker: {
                 color: 'rgba(53, 184, 143, 0.5)', //to have consistent colors with the site
                 size: 8
             },
             line: {
                 color: 'rgba(53, 184, 143, 0.5)',
                 width: 3
             }
         };

         const hdata = {
             x: timestamps,
             y: hvalues,
             type: 'scatter',
             name: '% Humidity',
             mode: 'lines+markers',
             marker: {
                 color: 'rgba(53,98,143,0.5)',
                 size: 8
             },
             line: {
                 color: 'rgba(53,98,143,0.5)',
                 width: 3
             }
         };

         const layout = {

             xaxis: {
                 title: '<b>Date</b>',
                 titlefont: {
                     family: 'Courier New, monospace',
                     size: 14,
                     color: '#000'
                 },
                 linecolor: '#000',
                 linewidth: 2
             },
             yaxis: {
                 title: '<b>Measurement</b>',
                 titlefont: {
                     family: 'Courier New, monospace',
                     size: 14,
                     color: '#000'
                 },
                 linecolor: '#000',
                 linewidth: 2
             },

             margin: {
                 r: 50,
                 pad: 0
             }
         }

         //Here, save the two traces in one object for plotly
         var data = [tdata, hdata];

         Plotly.newPlot(myPlotDiv1, data, layout, { responsive: true });

         //get average temp
         var avgTemp = tvalues.reduce(function(a, b) {
             return a + b;
         }, 0);

         avgTemp = avgTemp / tvalues.length;

         document.getElementById("temp-avg").innerHTML = avgTemp.toPrecision(5) + "°C";

         //get average humid
         var avghumid = hvalues.reduce(function(a, b) {
             return a + b;
         }, 0);

         avghumid = avghumid / hvalues.length;

         document.getElementById("humid-avg").innerHTML = avghumid.toPrecision(5) + "%";


         //get max humid and temp
         var indexOfMaxTemp = tvalues.reduce((tMax, x, i, ttvalues) => x > tvalues[tMax] ? i : tMax, 0);
         document.getElementById("temp-max").innerHTML = tvalues[indexOfMaxTemp].toPrecision(5) + "°C";
         document.getElementById("timet-max").innerHTML = moment.utc(timestamps[indexOfMaxTemp]).format('MMMM Do YYYY, h:mm:ss a');

         //get the timestamps for said max values
         var indexOfMaxHumid = hvalues.reduce((hMax, x, i, hhvalues) => x > hhvalues[hMax] ? i : hMax, 0);
         document.getElementById("humid-max").innerHTML = hvalues[indexOfMaxHumid].toPrecision(5) + "%";
         document.getElementById("timeh-max").innerHTML = moment.utc(timestamps[indexOfMaxHumid]).format('MMMM Do YYYY, h:mm:ss a');
     });


 }
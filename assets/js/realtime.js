 //send realtime data from the database to the HTML table slot
 firebase.database().ref('CurrentHumi').on("value", function(snapshot) {
     document.getElementById("humid-now").innerHTML = snapshot.val().toPrecision(5) + "%";
     //console.log(snapshot.val());
 }, function(error) {
     console.log("Error: " + error.code);
 });



 //same here but for temperature instead
 firebase.database().ref('CurrentTemp').on("value", function(snapshot) {
     document.getElementById("temp-now").innerHTML = snapshot.val().toPrecision(5) + "°C";
     //console.log(snapshot.val());
 }, function(error) {
     console.log("Error: " + error.code);
 });
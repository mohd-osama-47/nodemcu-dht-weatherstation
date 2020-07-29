/*
 * NodeMCU + Firebase Weather station.
 * BY: Mohammed Osama Elnour (GitHub: mohd-osama-47, LinkedIn: https://www.linkedin.com/in/mohammed-osama-44a249165/)
 * 
 * 
 * This program is meant to work in tandum with a website and database that are both hosted in Firebase.
 * This program sets up a NodeMCU controller and connectes it to a local WiFi network, sets up
 * a UDP server for Unix time stamps, and then reads sensor data at a user defined period. Said 
 * data is then sent to a Firebase Real-Time Database (RTDB) that logs all of the data in a structured manner.
 * 
 * The site then uses JS scripts to comb the data and perform analytics on it. Real-Time charts are also enabled
 * and are interactive in nature.
 * 
 * I used the FirebaseESP8266 and DHTesp librarires since they were the only ones from the ones I tested that gave me
 * satisfactory performance.
 * 
 * 
 * Feel free to use this code and share your results with me!
 */


#include <FirebaseESP8266.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <ESP8266WiFi.h>
#include <DHTesp.h>
#include <WiFiUdp.h>

#define NTP_OFFSET   0      // In seconds, add your offset here!
#define NTP_INTERVAL 60 * 1000    // In miliseconds, will refresh the timestamps depending on this amount
#define NTP_ADDRESS  "europe.pool.ntp.org"

#define FIREBASE_HOST "Enter your firebase link here WITHOUT https"
#define FIREBASE_AUTH "Enter the database secret here from Firebase"

#define WIFI_SSID "Network ID"
#define WIFI_PASSWORD "Network Password"

#define DHTPIN D0 // GPIO16, change to suit your application
#define DHTTYPE DHT11 

#define measure_delay 10000   //Set the amount of time, in millisecond, between measurements

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, NTP_ADDRESS, NTP_OFFSET, NTP_INTERVAL);

//Define FirebaseESP8266 data object for data sending and receiving
FirebaseData firebaseData;
FirebaseJson json;

DHTesp dht;

void setup () {
  Serial.begin (115200);  //change to 9600 if you are experience issues
  WiFi.begin (WIFI_SSID, WIFI_PASSWORD); 
  Serial.print ("Connecting to");
  Serial.print (WIFI_SSID);
  while (WiFi.status()!= WL_CONNECTED) {
    Serial.print (".");
    delay (500);
  }
  Serial.println ();
  Serial.print ("Connected to");
  Serial.print (" ");
  Serial.println (WIFI_SSID);
  Serial.print ("IP Address is:");
  Serial.println (WiFi.localIP ()); 
  
  Firebase.begin (FIREBASE_HOST, FIREBASE_AUTH); 
  
  dht.setup(DHTPIN, DHTesp::DHTTYPE); 
  
  timeClient.begin();
}

void loop () 
{
  timeClient.update();

  //Get the Unix time and save it as a human readable format for Serial Print purposes.
  String formattedTime = timeClient.getFormattedTime();
  int epcohTime =  timeClient.getEpochTime();

  //Read the sesnor data using the DHTesp library, other libraries gave me issues
  float h = dht.getHumidity(); 
  float t = dht.getTemperature(); 
    
  if (isnan(h) == 1 || isnan(t) == 1) {
    Serial.println ("Failed to read from DHT sensor!");
    return;
  }  
  
  Serial.print ("Humidity: ");
  Serial.println(h);
  Serial.print("Temperature: "); 
  Serial.print(t);
  Serial.println("°C");
  Serial.println("Time is: " + formattedTime);

  //for structured pushes, save the humidity, temperature, and timestamp in one JSON object and push them all together
  json.add("Humidity", h);
  json.add("Temperature", t);
  json.add("Time", epcohTime);

  
  //Firebase.push returns a boolean donating if the process of pushing the json object succeeded or not.
  if(Firebase.pushJSON(firebaseData, "Stampped DHT", json))
  {
    //Success
     Serial.println("DHT Success!");
  }

  //This is to send the current readings only WITHOUT time stamps, used in site to denote real-time measurements
  if(Firebase.set(firebaseData, "/CurrentTemp", t) && Firebase.set(firebaseData, "/CurrentHumi", h))
  {
    //Success
     Serial.println("Current Data Success!");
  }
  
  else{
    //Failed?, get the error reason from firebaseData

    Serial.print("Error in setInt, ");
    Serial.println(firebaseData.errorReason());
  }

   delay (measure_delay);
} 

#include <Arduino.h>
#include "goalCaptor.h"
#include "ledManager.h"
#include "gameManager.h"


const char* ssid = "SamsungA52s";         // Remplacez par le SSID de votre réseau Wi-Fi
const char* password = "nathanleboss"; // Remplacez par le mot de passe de votre

GameManager gameManager(ssid, password);
NetManager netManager(ssid, password);//(ssid, password);

void setup()
{


   Serial.begin(115200); // Initialisation de la communication série
   netManager.connect();
   Serial.println("Démarrage du système de détection de buts...");
   netManager.initMatch();
   // NetManager already constructed with credentials; no re-assignment needed.
}

void loop()
{

   //gameManager.setNetManager(netManager);
   gameManager.startGame();
}
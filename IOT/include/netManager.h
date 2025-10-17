#ifndef NET_MANAGER_H
#define NET_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>

class NetManager {
public:
    NetManager(const char* ssid, const char* password, const char* serverUrl = "192.168.237.45", int serverPort = 8080);
    void connect();
    bool isConnected();
    bool sendGoalEvent(int team);
    bool updateConnection();
    void initMatch();
    String listen();

private:
    const char* _ssid;
    const char* _password;
    const char* _serverUrl;
    WiFiClient _client;
    const int _serverPort;

    const int _matchId;
};

#endif // NET_MANAGER_H
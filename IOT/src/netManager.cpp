#include <Arduino.h>
#include "netManager.h"
#include <WiFi.h>

NetManager::NetManager(const char *ssid, const char *password, const char *serverUrl, int serverPort) : _ssid(ssid), _password(password), _serverUrl(serverUrl), _serverPort(serverPort), _matchId(0)
{
}
void NetManager::connect()
{
    Serial.println("Connecting to WiFi...");
    WiFi.mode(WIFI_AP);
    WiFi.setTxPower(WIFI_POWER_5dBm);
    WiFi.begin(_ssid, _password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
    }
}

String NetManager::listen()
{
    static WiFiServer server(_serverPort);
    static bool serverStarted = false;
    if (!serverStarted)
    {
        server.begin();
        serverStarted = true;
    }

    WiFiClient client = server.available();
    if (!client)
    {
        return String("");
    }

    client.setTimeout(2000);
    String requestLine = client.readStringUntil('\n');
    requestLine.trim();

    // Discard headers
    while (client.connected())
    {
        String line = client.readStringUntil('\n');
        if (line == "\r" || line.length() == 0)
            break;
    }
    // Extract the first path segment (e.g., "/begin" or "/end")
    int pos1 = requestLine.indexOf(' ');
    int pos2 = requestLine.indexOf(' ', pos1 + 1);
    String uri = (pos1 >= 0 && pos2 > pos1) ? requestLine.substring(pos1 + 1, pos2) : "/";
    if (uri.startsWith("/"))
        uri.remove(0, 1);
    int delim = uri.indexOf('/');
    String head = (delim >= 0) ? uri.substring(0, delim) : uri;
    head.toLowerCase();

    // Map to a command and handle via switch
    enum Cmd
    {
        CMD_NONE,
        CMD_BEGIN,
        CMD_END
    };
    Cmd cmd = CMD_NONE;
    if (head == "begin")
        cmd = CMD_BEGIN;
    else if (head == "end")
        cmd = CMD_END;

    int code = 404;
    String body = "not_found";
    String result = "";

    switch (cmd)
    {
    case CMD_BEGIN:
        code = 200;
        body = "ok";
        result = "begin";
        break;
    case CMD_END:
        code = 200;
        body = "ok";
        result = "end";
        break;
    default:
        break;
    }

    // Respond and return the command
    client.println(String("HTTP/1.1 ") + code + (code == 200 ? " OK" : " Not Found"));
    client.println("Content-Type: text/plain");
    client.println("Connection: close");
    client.println(String("Content-Length: ") + body.length());
    client.println();
    client.print(body);
    client.stop();

    return result;
}

bool NetManager::isConnected()
{
    return WiFi.status() == WL_CONNECTED;
}

void NetManager::initMatch()
{
    static WiFiServer server(_serverPort);
    static bool serverStarted = false;
    if (!serverStarted)
    {
        server.begin();
        serverStarted = true;
    }

    WiFiClient client = server.available();
    if (!client)
    {
        return;
    }

    client.setTimeout(2000);
    String requestLine = client.readStringUntil('\n');
    requestLine.trim();

    // Discard headers
    while (client.connected())
    {
        String line = client.readStringUntil('\n');
        if (line == "\r" || line.length() == 0)
            break;
    }

    // Parse path from request line
    String path = "/";
    int sp1 = requestLine.indexOf(' ');
    int sp2 = requestLine.indexOf(' ', sp1 + 1);
    if (sp1 > 0 && sp2 > sp1)
    {
        path = requestLine.substring(sp1 + 1, sp2);
    }

    // Respond to /init
    int status = 404;
    String body = "not_found";
    if (path == "/init")
    {
        status = 200;
        body = "ok";
    }

    client.print("HTTP/1.1 ");
    client.print(status);
    client.println(status == 200 ? " OK" : " Not Found");
    client.println("Content-Type: text/plain");
    client.print("Content-Length: ");
    client.println(body.length());
    client.println("Connection: close");
    client.println();
    client.print(body);
    client.stop();
}

bool NetManager::sendGoalEvent(int team)
{
    if (!isConnected())
    {
        Serial.println("WiFi non connecté");
        return false;
    }

    Serial.println("Envoi de l’événement pour l’équipe: " + String(team));

    if (_client.connect(_serverUrl, _serverPort))
    {
        String postData = "team=" + String(team);

        _client.println("POST /goal HTTP/1.1");
        _client.println(String("Host: ") + _serverUrl);
        _client.println("Content-Type: application/x-www-form-urlencoded");
        _client.println("Connection: close");
        _client.println(String("Content-Length: ") + postData.length());
        _client.println();
        _client.print(postData); 
        _client.flush();         
        delay(50);               
        _client.stop();

        Serial.println("Requête envoyée");
        return true;
    }

    Serial.println("Connexion au serveur échouée");
    return false;
}

bool NetManager::updateConnection()
{
    if (isConnected())
    {
        return true;
    }
    else
    {
        // connect();
        return false;
    }
}
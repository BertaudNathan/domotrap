#ifndef GAME_MANAGER_H
#define GAME_MANAGER_H

#include <Arduino.h>
#include "goalCaptor.h"
#include "ledManager.h"
#include "netManager.h"

class GameManager {
public:
    GameManager(const char* ssid, const char* password);
    void setNetManager(NetManager& netManager);
    void startGame();


private:
    GoalCaptor _goalCaptor1;
    GoalCaptor _goalCaptor2;
    LedManager _ledManager;
    NetManager _netManager;
};

#endif // GAME_MANAGER_H

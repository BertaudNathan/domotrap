#include "gameManager.h"
#include <Arduino.h>
#include "goalCaptor.h"
#include "ledManager.h"
#include "netManager.h"
#include "TeamEnum.h"


GameManager::GameManager(const char* ssid, const char* password)
    : _goalCaptor1(18, 19), _goalCaptor2(13, 12), _ledManager(), _netManager(ssid, password)
{
if (_netManager.updateConnection()) {
        _ledManager.turnWifi();
    } 
}


void GameManager::startGame()
{
    bool goal1 = _goalCaptor1.isGoalDetected();
    bool goal2 = _goalCaptor2.isGoalDetected();
    if (goal1 || goal2)
    {
        _ledManager.goal(goal1 ? 1 : 2);
        delay(3000); // Anti-rebond
        _netManager.sendGoalEvent(goal1 ? Team::BLUE : Team::RED);

    }
    if (_netManager.updateConnection()) {
        _ledManager.turnWifi();
    } else {
         _ledManager.turnOffWifi();
    }
}

void GameManager::setNetManager(NetManager& netManager)
{
    (void)netManager; // NetManager is not copy-assignable; keep existing instance
}
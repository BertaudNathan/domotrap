#include "ledManager.h"
LedManager::LedManager() : _led1(32,33, 25), _led2(16, 17, 05) {
    _led1.turnFonctionel();
    _led2.turnFonctionel();
}

void LedManager::goal(int team) {
    Serial.println("Goal detected for team: " + String(team));
    if (team == 1) {
        _led1.blinkgoal();
    } else if (team == 2) {
        _led2.blinkgoal();
    }
};

void LedManager::turnWifi() {
    _led1.turnWifi();
    _led2.turnWifi();
}

void LedManager::turnOffWifi() {
    _led1.turnOffWifi();
    _led2.turnOffWifi();
}

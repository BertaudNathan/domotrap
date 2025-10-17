#ifndef LED_GROUP_H
#define LED_GROUP_H

#include <Arduino.h>


class LedGroup {
public:
    LedGroup(int pinLedFonctionel, int pinLedEquipe, int pinLedWifi);
    void blinkgoal();
    void turnWifi();
    void turnFonctionel();
    void turnoff();
    void turnOffWifi();
private:
    int _pinLedFonctionel;
    int _pinLedEquipe;
    int _pinLedWifi;
    int _stateLedFonctionel;
    int _stateLedEquipe;
    int _stateLedWifi;
};
    
#endif // LED_GROUP_H
#include <Arduino.h>
#include "ledGroup.h"

LedGroup::LedGroup(int pinLedFonctionel, int pinLedEquipe, int pinLedWifi)
    : _pinLedFonctionel(pinLedFonctionel), _pinLedEquipe(pinLedEquipe), _pinLedWifi(pinLedWifi),
      _stateLedFonctionel(LOW), _stateLedEquipe(LOW), _stateLedWifi(LOW) {
    pinMode(_pinLedFonctionel, OUTPUT);
    pinMode(_pinLedEquipe, OUTPUT);
    pinMode(_pinLedWifi, OUTPUT);
}

void LedGroup::blinkgoal() {
    _stateLedEquipe = !_stateLedEquipe;
    digitalWrite(_pinLedEquipe, _stateLedEquipe);
    delay(1000);
    _stateLedEquipe = !_stateLedEquipe;
    digitalWrite(_pinLedEquipe, _stateLedEquipe);
}
void LedGroup::turnWifi() {
    _stateLedWifi = HIGH;
    digitalWrite(_pinLedWifi, _stateLedWifi);
}

void LedGroup::turnOffWifi() {
    _stateLedWifi = LOW;
    digitalWrite(_pinLedWifi, _stateLedWifi);
}
void LedGroup::turnFonctionel() {
    _stateLedFonctionel = HIGH;
    digitalWrite(_pinLedFonctionel, _stateLedFonctionel);
}
void LedGroup::turnoff() {
    _stateLedFonctionel = LOW;
    _stateLedEquipe = LOW;
    _stateLedWifi = LOW;
    digitalWrite(_pinLedFonctionel, _stateLedFonctionel);
    digitalWrite(_pinLedEquipe, _stateLedEquipe);
    digitalWrite(_pinLedWifi, _stateLedWifi);
}


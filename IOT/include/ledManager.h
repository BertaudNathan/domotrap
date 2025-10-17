#ifndef LED_MANAGER_H
#define LED_MANAGER_H
#include <Arduino.h>
#include "ledGroup.h"
class LedManager {
public:
    LedManager();
    void goal(int team);
    void turnWifi();
    void turnOffWifi();
private:
    LedGroup _led1;
    LedGroup _led2;
};
#endif // LED_MANAGER_H
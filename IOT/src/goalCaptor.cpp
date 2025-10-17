#include <Arduino.h>
#include "goalCaptor.h"

GoalCaptor::GoalCaptor(int trigPin, int echoPin) 
    : _trigPin(trigPin), _echoPin(echoPin), _distanceDetection(18) {
    pinMode(_trigPin, OUTPUT);
    pinMode(_echoPin, INPUT);
}

bool GoalCaptor::isGoalDetected() {
    long distance = readDistance();
    if (distance <= _distanceDetection && distance != 0) {
         Serial.println("Distance: " + String(distance));
         return true;
    }
    return false;
}

long GoalCaptor::readDistance() {
    digitalWrite(_trigPin, LOW);
    delayMicroseconds(5);
    digitalWrite(_trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(_trigPin, LOW);
    return pulseIn(_echoPin, HIGH) * 0.034 / 2;
}

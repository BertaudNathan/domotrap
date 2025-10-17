#ifndef GOAL_CAPTOR_H
#define GOAL_CAPTOR_H

#include <Arduino.h>

class GoalCaptor {
public:
    GoalCaptor(int trigPin, int echoPin);
    long readDistance();

    bool isGoalDetected();

private:
    int _trigPin;
    int _echoPin;
    long _distanceDetection;
};

#endif // GOAL_CAPTOR_H

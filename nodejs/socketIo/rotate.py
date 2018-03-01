#!/usr/bin/env python
# encoding: utf-8
import RPi.GPIO
import time
import sys

print '参数个数为:', len(sys.argv), '个参数。'
print '参数列表:', str(sys.argv)
SG90_PIN=12
RPi.GPIO.setmode(RPi.GPIO.BCM)
RPi.GPIO.setup(SG90_PIN, RPi.GPIO.OUT)
SG90_PWM = RPi.GPIO.PWM(SG90_PIN, 50)#频率设为60HZ，一个比较舒服的频率
SG90_PWM.start(0)
try:
    command = sys.argv[1]
    if (float(command) <= 180 and float(command) >= 0):
	a = float(command)
	t = float(sys.argv[2])
	#t = abs(a-b) / 180 * 2
	a = a / 180 * 10 + 2.5
        SG90_PWM.ChangeDutyCycle(a)
        time.sleep(t) 
        SG90_PWM.stop()
	RPi.GPIO.cleanup()
except KeyboardInterrupt:
    SG90_PWM.stop()
    RPi.GPIO.cleanup()

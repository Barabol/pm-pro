#include <Arduino.h>
#define GHOUSTING_TIME 400

struct Button {
  const uint8_t PIN;
  uint32_t numberKeyPresses;
  bool pressed;
  uint32_t usable;
  char code;
};
Button buttons[] = {
  { 23, 0, false, 0, '5' },
  { 22, 0, false, 0, '4' },
  { 16, 0, false, 0, '1' },
  { 17, 0, false, 0, '2' },
  { 18, 0, false, 0, '3' },
  { 19, 0, false, 0, 'K' },
  { 21, 0, false, 0, 'L' }
};
int mode = 0;
int analog[2] = { 0, 0 };

void incMod() {
  mode++;
  if (mode > 3)
    mode = 0;
}
void decMod() {
  mode--;
  if (mode < 0)
    mode = 3;
}

void ARDUINO_ISR_ATTR isr(void *arg) {
  Button *s = static_cast<Button *>(arg);
  if (s->usable + GHOUSTING_TIME > millis()) {
    return;
  }
  s->numberKeyPresses += 1;
  s->pressed = true;
  s->usable = millis();
  if (s->code <= '5')
    Serial.printf("%c", s->code);
  else {
    if (s->code == 'K')
      incMod();
    else
      decMod();
    Serial.printf("%c:%d", s->code, mode);
  }
}

void setupPin(struct Button *b) {
  pinMode(b->PIN, INPUT_PULLDOWN);
  attachInterruptArg(b->PIN, isr, b, FALLING);
}
void setup() {
  Serial.begin(115200);
  for (int x = 0; x < sizeof(buttons) / sizeof(struct Button); x++) {
    setupPin(&buttons[x]);
  }
  pinMode(15, OUTPUT);
  analogWrite(15, 0);
  /*
  setupPin(&button1);
  setupPin(&button2);
  setupPin(&button3);
  setupPin(&button4);
  setupPin(&button5);*/
}
int val;
int max_;
int blinkCounter = 0;
int modeIndex = 0;
void loop() {
  delay(100);
  analog[0] = analogRead(4);
  val = analog[0] - analog[1];
  val = val < 0 ? val * -1 : val;
  if (val > 50) {
    if (val > max_)
      max_ = val;
    Serial.printf("s:%d:%d", analog[0] - analog[1], analog[0]);
    analog[1] = analog[0];
  }
  if (blinkCounter == 0) {
    blinkCounter = 5;
    if (mode & modeIndex)
      analogWrite(15, 10);
    else
      analogWrite(15, 0);
      modeIndex++;
    modeIndex &= 3;
  } else
    blinkCounter--;
  /*
  static uint32_t lastMillis = 0;
  if (millis() - lastMillis > 10000) {
    lastMillis = millis();
    detachInterrupt(button1.PIN);
  }*/
}

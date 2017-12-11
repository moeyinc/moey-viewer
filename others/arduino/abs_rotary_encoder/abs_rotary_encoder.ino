volatile int pwm_value = 0;
volatile unsigned long int prev_time = 0;
#define INTERRUPT_PIN 2

void setup() {
  Serial.begin(115200);
  
  // when pin D2 goes high, call the rising function
  attachInterrupt(INTERRUPT_PIN, rising, RISING);
}

void loop() {
}

// ===================== rising =====================
void rising() {
  attachInterrupt(INTERRUPT_PIN, falling, FALLING);
  prev_time = micros();
}

// ===================== falling =====================
void falling() {
  // when falling event occurs...
  
  // attach next interrrupt function for rising
  attachInterrupt(INTERRUPT_PIN, rising, RISING);

  // calculate the duration since the previous rising event occurred
  pwm_value = micros() - prev_time;

  // write the value to the serial
  Serial.println("A" + String(pwm_value));
}

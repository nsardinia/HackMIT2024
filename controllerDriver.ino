#include "BluetoothSerial.h"

/*
#define SAMPLE_RATE 500
#define INPUT_PIN 39
#define BUFFER_SIZE 128

int circular_buffer[BUFFER_SIZE];
int data_index, sum;

*/
BluetoothSerial SerialBT;

const int potPin = 36;
int potValue = 0;

unsigned long lastBluetoothSend = 0;
const unsigned long bluetoothInterval = 1; // 1 millisecond

void setup() {
  Serial.begin(9600);
  Serial.println("Starting Bluetooth device...");
  
  if(!SerialBT.begin("Freddy")) {
    Serial.println("An error occurred initializing Bluetooth");
  } else {
    Serial.println("Bluetooth initialized. Device name: Freddy");
  }

  // Configure ADC
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);
}

void loop() {
  unsigned long currentMicros = micros();
  
  if (SerialBT.hasClient()) {
    // Bluetooth sending
      lastBluetoothSend = currentMicros;
      potValue = analogRead(potPin);
      int mappedValue = (map(potValue, 0 , 4095, 0 , 270)) + 55;
      SerialBT.println(mappedValue);
      delay(500);
    }

    /*
    // EMG processing
    static unsigned long lastEMGSample = 0;
    if (currentMicros - lastEMGSample >= 1000000 / SAMPLE_RATE) {
      lastEMGSample = currentMicros;
      int sensor_value = analogRead(INPUT_PIN);
      int signal = EMGFilter(sensor_value);
      int envelop = getEnvelop(abs(signal));
      
      Serial.println(sensor_value);
      Serial.println(signal);
     // Serial.print(",");
      Serial.println(envelop);
      //Serial.print(",");
      //SerialBT.print(signal);
      //SerialBT.print(",");
      //SerialBT.println(envelop);
      */
    }
  } else {
    Serial.println("Waiting for Bluetooth connection...");
    delay(1000);  // Wait 1 second before checking again
  }
}

/*
// Envelop detection algorithm
int getEnvelop(int abs_emg){
	sum -= circular_buffer[data_index];
	sum += abs_emg;
	circular_buffer[data_index] = abs_emg;
	data_index = (data_index + 1) % BUFFER_SIZE;
	return (sum/BUFFER_SIZE) * 2;
}

// Band-Pass Butterworth IIR digital filter, generated using filter_gen.py.
// Sampling rate: 500.0 Hz, frequency: [74.5, 149.5] Hz.
// Filter is order 4, implemented as second-order sections (biquads).
// Reference: 
// https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.butter.html
// https://courses.ideate.cmu.edu/16-223/f2020/Arduino/FilterDemos/filter_gen.py
float EMGFilter(float input)
{
  float output = input;
  {
    static float z1, z2; // filter section state
    float x = output - 0.05159732*z1 - 0.36347401*z2;
    output = 0.01856301*x + 0.03712602*z1 + 0.01856301*z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2; // filter section state
    float x = output - -0.53945795*z1 - 0.39764934*z2;
    output = 1.00000000*x + -2.00000000*z1 + 1.00000000*z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2; // filter section state
    float x = output - 0.47319594*z1 - 0.70744137*z2;
    output = 1.00000000*x + 2.00000000*z1 + 1.00000000*z2;
    z2 = z1;
    z1 = x;
  }
  {
    static float z1, z2; // filter section state
    float x = output - -1.00211112*z1 - 0.74520226*z2;
    output = 1.00000000*x + -2.00000000*z1 + 1.00000000*z2;
    z2 = z1;
    z1 = x;
  }
  return output;
}
*/

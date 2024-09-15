import { computed, Injectable, signal } from '@angular/core';
import { Call, StreamVideoClient, User } from '@stream-io/video-client';
import { api_keys } from '../../public/API_keys';
import { StreamChat, MessageResponse } from 'stream-chat';

@Injectable({
  providedIn: 'root',
})
export class CallingService {
  callId = signal<string | undefined>(undefined);

  chatClient: StreamChat;
  sensorChannel: any; // This will hold the messaging channel for sensor data

  call = computed<Call | undefined>(() => {
    const currentCallId = this.callId();
    if (currentCallId !== undefined) {
      console.log('Hi');
      const call = this.client.call('default', currentCallId);

      call.join({ create: true }).then(async () => {
        call.camera.enable();
        call.microphone.enable();
        this.initializeSensorChannel(currentCallId); // Initialize sensor data channel
      });
      return call;
    } else {
      return undefined;
    }
  });

  client: StreamVideoClient;

  constructor() {
    const apiKey = api_keys.key;
    const token = api_keys.token;
    const user: User = { id: api_keys.user };

    // Initialize Stream Video client
    this.client = new StreamVideoClient({ apiKey, token, user });

    // Initialize Stream Chat client
    this.chatClient = new StreamChat(apiKey);
    this.chatClient.connectUser(
      { id: api_keys.user }, // Current user (doctor or patient)
      token
    );
  }

  // Create or join a channel for sensor data
  async initializeSensorChannel(callId: string) {
    // You can use the callId as the channel ID for the sensor data
    this.sensorChannel = this.chatClient.channel('messaging', callId, {
      name: 'Sensor Data Channel',
    });

    await this.sensorChannel.watch();

    // Listen for incoming sensor data
    this.sensorChannel.on(
      'message.new',
      (event: { message: MessageResponse }) => {
        console.log('New sensor data received:', event.message.text);
        // Handle the received sensor data (e.g., display it on the doctor’s dashboard)
      }
    );
  }

  // Method to send sensor data from the patient
  async sendSensorData(sensorData: string) {
    if (this.sensorChannel) {
      await this.sensorChannel.sendMessage({
        text: sensorData, // Replace this with actual sensor data
      });
      console.log('Sensor data sent:', sensorData);
    }
  }

  setCallId(callId: string | undefined) {
    if (callId === undefined) {
      this.call()?.leave();
    }
    this.callId.set(callId);
  }
}

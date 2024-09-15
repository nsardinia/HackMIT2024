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
  sensorChannel: any;

  call = computed<Call | undefined>(() => {
    const currentCallId = this.callId();
    if (currentCallId !== undefined) {
      const call = this.client.call('default', currentCallId);

      call.join({ create: true }).then(async () => {
        call.camera.enable();
        call.microphone.enable();
        this.initializeSensorChannel(currentCallId);
      });
      this.chatClient.connectUser({ id: api_keys.user }, api_keys.token);
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
  }

  // Initialize the channel for sensor data
  async initializeSensorChannel(callId: string) {
    this.sensorChannel = this.chatClient.channel('messaging', callId, {
      name: 'Sensor Data Channel',
    });

    await this.sensorChannel.watch();
  }

  // Subscribe to sensor data messages with a callback
  onSensorData(callback: (message: MessageResponse) => void) {
    if (this.sensorChannel) {
      this.sensorChannel.on(
        'message.new',
        (event: { message: MessageResponse }) => {
          callback(event.message);
        }
      );
    }
  }

  // Method to send sensor data from the patient
  async sendSensorData(sensorData: string) {
    if (this.sensorChannel) {
      await this.sensorChannel.sendMessage({
        text: sensorData,
      });
      console.log('Sensor data sent:', sensorData);
    }
  }

  setCallId(callId: string | undefined) {
    if (callId === undefined) {
      this.call()?.leave();
      this.chatClient.disconnectUser();
    }
    this.callId.set(callId);
  }
}

import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  ChatClientService,
  ChannelService,
  StreamI18nService,
  StreamAutocompleteTextareaModule,
  StreamChatModule,
} from 'stream-chat-angular';
import { CallingService } from './calling.service';
import { CommonModule } from '@angular/common';
import { CallComponent } from './call/call.component';
import { BluetoothComponent } from './bluetooth/bluetooth.component';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SerialService } from './serial.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule,
    StreamAutocompleteTextareaModule,
    StreamChatModule,
    CallComponent,
    BluetoothComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  callingService: CallingService;

  constructor(
    callingService: CallingService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private serialService: SerialService
  ) {
    this.callingService = callingService;
  }

  setCallId(callId: string) {
    this.callingService.setCallId(callId);
  }

  setNameId(userId: string) {}

  isDropdownOpen: { [key: string]: boolean } = {};

  toggleDropdown(dropdownId: string): void {
    this.isDropdownOpen[dropdownId] = !this.isDropdownOpen[dropdownId];
  }
  Baudrate: number = 9600;
  DataBits: number = 8;
  Parity: string = 'none';
  StopBits: number = 1;

  isConnected: boolean = false;
  private connectionSubscription: Subscription | undefined;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (!(navigator as any).serial) {
        alert('Please Use Chrome or Edge!');
      }
    }

    this.connectionSubscription = this.serialService.isConnected$.subscribe(
      (isConnected) => (this.isConnected = isConnected)
    );
  }

  ngOnDestroy() {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
  }

  async open() {
    try {
      await this.serialService.open({
        baudRate: this.Baudrate,
        dataBits: this.DataBits,
        parity: this.Parity,
        stopBits: this.StopBits,
      });
    } catch (e) {
      console.error('Failed to open serial port', e);
    }
  }

  async close() {
    await this.serialService.close();
  }
}

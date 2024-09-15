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
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { debounceTime, Subject, buffer, Subscription, timer } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SerialService } from './serial.service';
import { GraphingComponent } from './graphing/graphing.component';

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
    GraphingComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  callingService: CallingService;
  private dataSubject = new Subject<string>();
  private dataSubscription: Subscription;
  private bufferSubject = new Subject<void>();
  private readonly CHUNK_INTERVAL = 1000; // 1 second

  constructor(
    callingService: CallingService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private serialService: SerialService
  ) {
    this.callingService = callingService;

    // Set up throttled data sending
    this.dataSubscription = this.dataSubject
      .pipe(buffer(this.bufferSubject), debounceTime(50))
      .subscribe((dataChunk) => {
        if (dataChunk.length > 0) {
          const combineData = dataChunk.join('\n');
          callingService.sendSensorData(combineData);
        }
      });

    // Trigger buffer flush every CHUNK_INTERVAL
    timer(0, this.CHUNK_INTERVAL).subscribe(() => this.bufferSubject.next());

    serialService.data$.subscribe((data) => {
      this.dataSubject.next(data.toString());
    });
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
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
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

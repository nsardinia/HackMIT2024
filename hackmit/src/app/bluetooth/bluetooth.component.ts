import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SerialService } from '../serial.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-bluetooth',
  standalone: true,
  imports: [],
  templateUrl: './bluetooth.component.html',
  styleUrl: './bluetooth.component.scss',
})
export class BluetoothComponent implements OnInit, OnDestroy {
  Baudrate: number = 9600;
  DataBits: number = 8;
  Parity: string = 'none';
  StopBits: number = 1;

  isConnected: boolean = false;
  private connectionSubscription: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private serialService: SerialService
  ) {}

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

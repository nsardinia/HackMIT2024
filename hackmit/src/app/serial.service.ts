import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { buffer, debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SerialService {
  private port: any;
  private reader: any;
  private dataSubject = new Subject<number>();
  public data$: Observable<number>;

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$: Observable<boolean> =
    this.isConnectedSubject.asObservable();
  private reading = false;

  constructor() {
    this.data$ = this.dataSubject.asObservable();
    this.isConnected$.subscribe((isConnected) => {
      this.reading = isConnected;
    });
  }

  async open(options: SerialOptions) {
    this.port = await (navigator as any).serial.requestPort();
    try {
      await this.port.open(options);

      // If we reach this point, the port has been successfully opened
      this.isConnectedSubject.next(true);
      this.read();
    } catch (error) {
      console.error('Failed to open serial port:', error);
      // Ensure we're in a disconnected state if anything goes wrong
      this.isConnectedSubject.next(false);
      await this.port.close();
      return Promise.reject(error);
    }
  }

  // Close the serial communication
  async close() {
    this.isConnectedSubject.next(false);
    await this.reader.cancel();
    console.log('serial port closed');
  }

  async read() {
    // Make sure we are connected to a port
    if (this.port == null) {
      console.error('failed to read from serial port');
      return;
    }
    // While the port is readable
    while (this.port.readable && this.reading) {
      // Creates a reader on the stream and locks it so no other readers can be acquired until this one is released.
      this.reader = this.port.readable.getReader();

      // Try to read from the reader
      try {
        // Constantly get data from the reader
        let lineBuffer = '';
        while (true) {
          const { value, done } = await this.reader.read();

          // Is there no more data to read?
          if (done) {
            break;
          }

          // Create a decoder since we are sending the data as ASCII strings
          let utf8decoder = new TextDecoder();
          let in_char = utf8decoder.decode(value);
          if (!isNaN(parseFloat(in_char))) {
            this.dataSubject.next(parseFloat(in_char));
          }
        }
      } catch (error) {
        console.log('error ' + error);
      } finally {
        this.reader.releaseLock();
      }
    }

    await this.port.close();
  }
}

interface SerialOptions {
  baudRate: number;
  dataBits: number;
  parity: string;
  stopBits: number;
}

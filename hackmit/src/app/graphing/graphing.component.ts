import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { SerialService } from '../serial.service';
import { CallingService } from '../calling.service';
import { MessageResponse } from 'stream-chat';

declare var Plotly: any;

@Component({
  selector: 'app-graphing',
  standalone: true,
  imports: [],
  templateUrl: './graphing.component.html',
  styleUrl: './graphing.component.scss',
})
export class GraphingComponent implements OnInit, OnDestroy {
  private intervalId: any; // Interval identifier
  public array: number[] = [];
  private window: number[] = [];
  private windowLength = 30;
  private dataBuffer: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private callingService: CallingService
  ) {
    // Listen for incoming sensor data
    callingService.sensorChannel.on(
      'message.new',
      (event: { message: MessageResponse }) => {
        console.log('New sensor data received:', event.message.text);
        // Handle the received sensor data (e.g., display it on the doctor’s dashboard)
        this.handleIncomingData(event.message.text!);
      }
    );
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // This code will only execute in the browser
      this.loadPlotly();
    }
  }

  loadPlotly(): void {
    // Load Plotly script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
    script.onload = () => {
      // Plotly script loaded, init the plot
      Plotly.newPlot('plot', [
        {
          y: [0],
          mode: 'lines',
          line: { color: '#80CAF6' },
        },
      ]);
    };
    document.head.appendChild(script);
  }

  // Start updating the plot in real-time
  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 1); // Update every second
  }

  updatePlot(): void {
    var data_update = {
      y: [this.window],
    };

    Plotly.update('plot', data_update);
  }

  handleIncomingData(chunk: string): void {
    this.dataBuffer += chunk;
    let newlineIndex: number;

    while ((newlineIndex = this.dataBuffer.indexOf('\n')) !== -1) {
      const line = this.dataBuffer.slice(0, newlineIndex).trim();
      this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1);

      if (line) {
        const data = parseFloat(line);
        if (!isNaN(data)) {
          this.receiveData(data);
        }
      }
    }
  }

  receiveData(data: number): void {
    this.array = this.array.concat(data);
    this.window = this.window.concat(data);
    if (this.window.length > this.windowLength) {
      this.window.splice(0, 1);
    }
    if (this.array.length == this.windowLength) {
      this.startRealtimeUpdate();
    }
  }

  // Clean up the interval when the component is destroyed
  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}

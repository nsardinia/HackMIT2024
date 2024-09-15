import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CallingService } from '../calling.service';
import { MessageResponse } from 'stream-chat';

declare var Plotly: any;

@Component({
  selector: 'app-graphing',
  standalone: true,
  templateUrl: './graphing.component.html',
  styleUrl: './graphing.component.scss',
})
export class GraphingComponent implements OnInit, OnDestroy {
  private intervalId: any;
  public array: number[] = [];
  private window: number[] = [];
  private windowLength = 30;
  private dataBuffer: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private callingService: CallingService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadPlotly();

      // Register the callback to handle new sensor data
      this.callingService.onSensorData((message: MessageResponse) => {
        console.log('New sensor data received:', message.text);
        this.handleIncomingData(message.text!);
      });
    }
  }

  loadPlotly(): void {
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
    script.onload = () => {
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

  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 1000);
  }

  updatePlot(): void {
    const dataUpdate = {
      y: [this.window],
    };

    Plotly.update('plot', dataUpdate);
  }

  handleIncomingData(chunk: string): void {
    console.log(chunk);

    this.dataBuffer += chunk;
    let newlineIndex: number;

    while ((newlineIndex = this.dataBuffer.indexOf('\n')) !== -1) {
      const line = this.dataBuffer.slice(0, newlineIndex).trim();
      this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1);

      if (line) {
        const data = parseFloat(line);
        console.log(data);
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
    if (this.array.length === this.windowLength) {
      this.startRealtimeUpdate();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}

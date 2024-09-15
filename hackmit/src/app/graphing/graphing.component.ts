import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CallingService } from '../calling.service';
import { MessageResponse } from 'stream-chat';
import { Subscription } from 'rxjs';

declare var Plotly: any;

@Component({
  selector: 'app-graphing',
  templateUrl: './graphing.component.html',
  styleUrl: './graphing.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class GraphingComponent implements OnInit, OnDestroy {
  private intervalId: any; // Interval identifier
  public array: number[] = [];
  private window: number[] = [];
  private windowLength = 100;
  private dataBuffer: string = '';

  private dataSubscription: Subscription | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private callingService: CallingService
  ) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Ensure Plotly and the sensor channel are both ready
      await this.loadPlotly();

      this.dataSubscription = this.callingService.sensorData$.subscribe(
        (data) => this.handleIncomingData(data.text!)
      );
    }
  }

  private loadPlotly(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
      script.onload = () => {
        Plotly.newPlot(
          'plot',
          [
            {
              y: [0],
              mode: 'lines',
              line: { color: '#80CAF6' },
            },
          ],
          {
            yaxis: {
              range: [0, 200], // Set the y-axis range from 0 to 200
            },
            xaxis: {
              showline: false, // Hide the x-axis line
              showgrid: false, // Hide the x-axis grid
              zeroline: false, // Hide the x-axis zero line
              showticklabels: false, // Hide the x-axis tick labels
            },
          }
        );
        resolve(); // Plotly loaded, resolve the Promise
      };
      document.head.appendChild(script);
    });
  }

  // Start updating the plot in real-time
  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 1000); // Update every second
  }

  updatePlot(): void {
    const data_update = {
      y: [this.window],
    };
    Plotly.update('plot', data_update);
  }

  handleIncomingData(chunk: string): void {
    console.log('Incoming chunk: ' + chunk);
    this.dataBuffer += '\n' + chunk;
    console.log('Databuffer (before) :' + this.dataBuffer);
    let newlineIndex: number;

    while ((newlineIndex = this.dataBuffer.indexOf('\n')) !== -1) {
      const line = this.dataBuffer.slice(0, newlineIndex).trim();
      console.log('line :' + line);
      this.dataBuffer = this.dataBuffer.slice(newlineIndex + 1);
      console.log('Databuffer (after) :' + this.dataBuffer);
      if (line) {
        const data = parseFloat(line);
        if (!isNaN(data)) {
          this.receiveData(data);
        }
      }
    }
  }

  receiveData(data: number): void {
    this.array.push(data);
    this.window.push(data);
    if (this.window.length > this.windowLength) {
      this.window.shift();
    }
    if (this.array.length === this.windowLength) {
      this.startRealtimeUpdate();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}

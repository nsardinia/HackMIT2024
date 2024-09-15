import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CallingService } from '../calling.service';
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
  private intervalId: any;
  public array: number[] = [];
  private angleWindow: number[] = [];
  private velocityWindow: number[] = [];
  private accelerationWindow: number[] = [];
  private windowLength = 100;
  private dataBuffer: string = '';

  angularVelocity: Array<number> = [];
  angularAcceleration: Array<number> = [];

  private dataSubscription: Subscription | undefined;

  private lastAngle: number | null = null;
  private lastVelocity: number | null = null;
  private lastTimestamp: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private callingService: CallingService
  ) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
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
              name: 'Angle',
              yaxis: 'y',
            },
            {
              y: [0],
              mode: 'lines',
              line: { color: '#FF6347' },
              name: 'Angular Velocity (degrees/s)',
              yaxis: 'y2',
            },
            {
              y: [0],
              mode: 'lines',
              line: { color: '#32CD32' },
              name: 'Angular Acceleration (degrees/s^2)',
              yaxis: 'y3',
            },
          ],
          {
            height: 450, // Increased height
            margin: { l: 80, r: 80, t: 50, b: 50 }, // Increased margins
            yaxis: {
              title: 'Angle (degrees)',
              range: [0, 180],
              side: 'left',
              titlefont: { color: '#80CAF6' },
              tickfont: { color: '#80CAF6' },
              zeroline: false,
            },
            yaxis2: {
              overlaying: 'y',
              side: 'right',
              position: 1, // Moved to the far right
              titlefont: { color: '#FF6347' },
              tickfont: { color: '#FF6347' },
              zeroline: false,
            },
            yaxis3: {
              overlaying: 'y',
              side: 'right',
              position: 1,
              titlefont: { color: '#32CD32' },
              tickfont: { color: '#32CD32' },
              zeroline: false,
            },
            xaxis: {
              showline: true,
              showgrid: true,
              zeroline: true,
              showticklabels: true,
              title: 'Time',
              domain: [0.1, 0.9], // Adjust x-axis domain to make room for y-axes
            },
            showlegend: true,
            legend: {
              x: 0,
              y: 1.15,
              orientation: 'h',
              traceorder: 'normal',
            },
          }
        );
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  startRealtimeUpdate(): void {
    this.intervalId = setInterval(() => {
      this.updatePlot();
    }, 1000);
  }

  updatePlot(): void {
    const data_update = [
      { y: [this.angleWindow] },
      { y: [this.velocityWindow] },
      { y: [this.accelerationWindow] },
    ];
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
    if (this.callingService.maxAngle < data) {
      this.callingService.maxAngle = data;
    }
    if (this.callingService.minAngle > data) {
      this.callingService.minAngle = data;
    }

    this.callingService.avgAngle += data;
    this.callingService.avgAngle /= 2;

    const currentTime = Date.now();
    if (this.lastAngle !== null && this.lastTimestamp !== null) {
      const deltaTime = (currentTime - this.lastTimestamp) / 1000; // Convert to seconds
      const angularVelocity = (data - this.lastAngle) / deltaTime;

      if (this.lastVelocity !== null) {
        const angularAcceleration =
          (angularVelocity - this.lastVelocity) / deltaTime;
        this.angularAcceleration.push(angularAcceleration);
        this.accelerationWindow.push(angularAcceleration);
        if (this.accelerationWindow.length > this.windowLength) {
          this.accelerationWindow.shift();
        }
      }

      this.angularVelocity.push(angularVelocity);
      this.velocityWindow.push(angularVelocity);
      if (this.velocityWindow.length > this.windowLength) {
        this.velocityWindow.shift();
      }
      this.lastVelocity = angularVelocity;
    }

    this.lastAngle = data;
    this.lastTimestamp = currentTime;

    this.array.push(data);
    this.angleWindow.push(data);
    if (this.angleWindow.length > this.windowLength) {
      this.angleWindow.shift();
    }
    if (this.array.length === this.windowLength) {
      this.startRealtimeUpdate();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}

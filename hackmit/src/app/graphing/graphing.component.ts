import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { SerialService } from '../serial.service';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private serialService: SerialService
  ) {
    serialService.data$.subscribe((data) => {
      this.receiveData(data);
    });
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
            range: [0, 200], // Set the y-axis range from 0 to 180
          },
          xaxis: {
            showline: false, // Hide the x-axis line
            showgrid: false, // Hide the x-axis grid
            zeroline: false, // Hide the x-axis zero line
            showticklabels: false, // Hide the x-axis tick labels
          },
        }
      );
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

import { Component } from '@angular/core';
import { CallingService } from '../calling.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  callingService: CallingService;

  constructor(private callService: CallingService) {
    this.callingService = callService;
  }
}

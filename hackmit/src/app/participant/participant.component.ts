import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { StreamVideoParticipant } from '@stream-io/video-client';
import { CallingService } from '../calling.service';

@Component({
  selector: 'app-participant',
  standalone: true,
  imports: [],
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss',
})
export class ParticipantComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;

  @Input() participant!: StreamVideoParticipant;
  unbindVideoElement: (() => void) | undefined;
  unbindAudioElement: (() => void) | undefined;

  constructor(private callingService: CallingService) {}

  ngAfterViewInit(): void {
    this.unbindVideoElement = this.callingService
      .call()
      ?.bindVideoElement(
        this.videoElement.nativeElement,
        this.participant.sessionId,
        'videoTrack'
      );

    this.unbindAudioElement = this.callingService
      .call()
      ?.bindAudioElement(
        this.videoElement.nativeElement,
        this.participant.sessionId
      );
  }

  ngOnDestroy(): void {
    this.unbindVideoElement?.();
    this.unbindAudioElement?.();
  }
}

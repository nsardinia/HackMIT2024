import { Component, Input, Signal } from '@angular/core';
import { Call, StreamVideoParticipant } from '@stream-io/video-client';
import { CallingService } from '../calling.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ParticipantComponent } from '../participant/participant.component';

@Component({
  selector: 'app-call',
  standalone: true,
  imports: [CommonModule, ParticipantComponent],
  templateUrl: './call.component.html',
  styleUrl: './call.component.scss',
})
export class CallComponent {
  @Input({ required: true }) call!: Call;
  participants: Signal<StreamVideoParticipant[]>;

  constructor(private callingService: CallingService) {
    this.participants = toSignal(
      this.callingService.call()!.state.participants$,
      { requireSync: true }
    );
  }

  toggleMicrophone() {
    this.call.microphone.toggle();
  }

  toggleCamera() {
    this.call.camera.toggle();
  }

  trackBySessionId(_: number, participants: StreamVideoParticipant) {
    return participants.sessionId;
  }

  leaveCall() {
    this.callingService.setCallId(undefined);
  }
}

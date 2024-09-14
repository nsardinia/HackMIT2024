import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  ChatClientService,
  ChannelService,
  StreamI18nService,
  StreamAutocompleteTextareaModule,
  StreamChatModule,
} from 'stream-chat-angular';
import { CallingService } from './calling.service';
import { CommonModule } from '@angular/common';
import { CallComponent } from './call/call.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule,
    StreamAutocompleteTextareaModule,
    StreamChatModule,
    CallComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  callingService: CallingService;

  constructor(callingService: CallingService) {
    this.callingService = callingService;
  }

  setCallId(callId: string) {
    this.callingService.setCallId(callId);
  }

  setNameId(userId: string) {}
}

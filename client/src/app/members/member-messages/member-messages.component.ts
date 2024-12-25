import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TimeagoModule } from 'ngx-timeago';

import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
  imports: [CommonModule, NgFor, TimeagoModule, FormsModule]
})
export class MemberMessagesComponent {
  messageService = inject(MessageService);
  @Input() username: string | undefined;
  // @Input() messages?: Message[] = [];
  messageContent: string = '';
  // @Output() updateMessages = new EventEmitter();
  @ViewChild('messageForm') messageForm?: NgForm;
  // loadMessages(){
  //   this.messageService.getMessageThread(this.username).subscribe({
  //     next: messages => this.messages = messages
  //   })
  // }

  sendMessages(){
    // this.messageService.sendMessages(this.username, this.messageContent).subscribe({
    //   next: message => {
    //     // this.updateMessages.emit(message);
    //     this.messageForm?.reset();
    //   }
    // })
    this.messageService.sendMessages(this.username, this.messageContent).then(() => {
        this.messageForm?.reset();
    })
  }
}

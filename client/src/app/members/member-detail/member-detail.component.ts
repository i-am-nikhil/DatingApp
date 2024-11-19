import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  imports: [CommonModule, TabsModule, GalleryModule, DatePipe, TimeagoModule, MemberMessagesComponent]
})
export class MemberDetailComponent implements OnInit {
  
  member: Member = {} as Member;  
  images: GalleryItem[] = [];
  private memberService: MembersService = inject(MembersService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  private messageService: MessageService = inject(MessageService);
  activeTab?: TabDirective;
  messages: Message[] = [];

  ngOnInit(): void {
    // this.loadMember();
    this.activatedRoute.data.subscribe({
      next: data => {
        this.member = data['member'];
        this.getImages();
      }
    })
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  // loadMember(){
  //   const username = this.activatedRoute.snapshot.paramMap.get('username');
  //   if (!username) {
  //     return;
  //   }
  //   this.memberService.getMember(username as string).subscribe({
  //     next: member => {this.member = member,
  //     this.getImages()
  //     }
  //   });
  // }

  getImages(){
    if (this.member == null) return;
    for(const photo of this.member?.photos){
      this.images.push(new ImageItem({src: photo.url, thumb: photo.url}));
    }
  }

  onUpdateMessages(event: Message){
    this.messages.push(event);
  }

  selectTab(heading: string){
    if (this.memberTabs){
      const messageTab = this.memberTabs.tabs.find(x=> x.heading === heading);
      if (messageTab) messageTab.active = true;
    }
  }

  onTabActivated(data: TabDirective){
    this.activeTab = data
    if(this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member){
      console.log(this.member.userName);
      this.messageService.getMessageThread(this. member.userName).subscribe({
        next: messages => this.messages = messages
      })
    }
  }
}

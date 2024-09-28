import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  imports: [CommonModule, TabsModule, GalleryModule, DatePipe, TimeagoModule]
})
export class MemberDetailComponent implements OnInit {
  
  member?: Member;  
  images: GalleryItem[] = [];
  private memberService: MembersService = inject(MembersService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(){
    const username = this.activatedRoute.snapshot.paramMap.get('username');
    if (!username) {
      return;
    }
    this.memberService.getMember(username as string).subscribe({
      next: member => {this.member = member,
      this.getImages()
      }
    });
  }

  getImages(){
    if (this.member == null) return;
    for(const photo of this.member?.photos){
      this.images.push(new ImageItem({src: photo.url, thumb: photo.url}));
    }
  }
}

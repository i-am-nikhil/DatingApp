import { Component, Input, ViewEncapsulation, computed, inject } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { LikesService } from 'src/app/_services/likes.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css'],
})
export class MemberCardComponent {
  private likesService = inject(LikesService);
  @Input() member: Member | undefined;
  hasLiked = computed(() => {
    return this.member ? this.likesService.likeIds().includes(this.member.id) : false;
  });

  toggleLike(){
    this.likesService.toggleLike(this.member?.id).subscribe({
      next: () => {
        if (this.hasLiked()){
          this.likesService.likeIds.update(ids => ids.filter(x => x !== this.member?.id))
        } else  if (this.member !== undefined){
          let id = this.member.id
          this.likesService.likeIds.update(ids => [...ids, id])
        }
      }
    })
  }
}

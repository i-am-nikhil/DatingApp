import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TimeagoModule, TimeagoPipe } from 'ngx-timeago';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit{
  @ViewChild('editForm') editForm?: NgForm; // the first editForm reflects what template variable we are referring to. 
  // the second editForm is what we would be using here in the component. Also, the editForm uses '?' because first the component initializes and then the view.
  // which means at that time we won't have the value of this.
  @HostListener('window:beforeunload', ['$event']) notify($event: any){
    if (this.editForm?.dirty){
      $event.returnValue = true;
    }
  }
  private toastr = inject(ToastrService);
  ngOnInit(): void {
    this.loadMember();
  }
  member?: Member;
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);

  loadMember(){
    const user = this.accountService.currentUser();
    if(!user) return;

    this.memberService.getMember(user.userName).subscribe({
      next: member => this.member = member
    })
  }

  updateMember(){
    this.memberService.updateMember(this.editForm?.value).subscribe({ // Notice how this.editForm.value has automatically been converted
                                                                      // into Member which is the expected parameter for updateMember()
      next: _ => {this.toastr.success('Profile updated successfully');
      this.editForm?.reset(this.member);}
    })
  }

  onMemberChange(event: Member){
    this.member = event;
  }
}

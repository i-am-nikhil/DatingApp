import { Component, OnInit, inject } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { UserParams } from 'src/app/_models/userParams';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit{
  memberService = inject(MembersService);
  // private accountService = inject(AccountService);
  // userParams = new UserParams(this.accountService.currentUser())
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];
  ngOnInit(): void {
    console.log('Nikhil' + !this.memberService.paginatedResult()? 'not null' : 'null')
    // if (!this.memberService.paginatedResult()) 
    this.loadMembers();
  }

  loadMembers(){
    this.memberService.getMembers();
  }

  resetFilters(){
    this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged(event: any){
    if (this.memberService.userParams().pageNumber!= event.page) {
      this.memberService.userParams().pageNumber = event.page;
      this.loadMembers();
    }
  }
}

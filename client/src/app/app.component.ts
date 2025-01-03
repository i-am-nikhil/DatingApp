import { Component, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';
import { User } from './_models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser(){
    let userString = localStorage.getItem('user');
    if (userString){
      const user: User = JSON.parse(userString);
      // this.accountService.setCurrentUser(user);
      this.accountService.setCurrentUser(user);
    }
  }

}

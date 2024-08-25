import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  registerMode= false;
  RegisterToggle(){
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode($event: boolean) {
    this.registerMode = $event;
    }

      // getUsers(){
  //   this.http.get('https://localhost:5000/api/users').subscribe({
  //       next: response => {this.users = response;
  //         console.log(this.users);
  //       },
  //       error: error => console.log(error),
  //       complete: () => console.log('Request completed')
  //     }); // observables are lazy in nature. it won't return anything unless someone has subscribed to it. Get
  //     // returns an observable, which is being subscribed to that the response is fetched.
  // }
}

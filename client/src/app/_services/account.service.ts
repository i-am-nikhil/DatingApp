import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null); // BehaviorSubject allows us to create an observable with an initial value.
  // | denotes Union type where a thing can be more than one type.
  //currentUser$ = this.currentUserSource.asObservable();
  currentUser = signal<User | null>(null);
  constructor(private http: HttpClient) { }

  login(model: any){
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          console.log(user.userName);
          // this.currentUserSource.next(user);
          this.currentUser.set(user);
        }
      })
    )
  }

  register(model: any){
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((response: User) => {
        const user = response
        if (user)
        localStorage.setItem('user', JSON.stringify(user));
      console.log(user.userName);
        // this.currentUserSource.next(user);
        this.currentUser.set(user);
        return user;
      })
    )
  }

  setCurrentUser(user: User){
    this.currentUserSource.next(user);
  }

  logout(){
    localStorage.removeItem('user');
    // this.currentUserSource.next(null);
    this.currentUser.set(null);
  }
}

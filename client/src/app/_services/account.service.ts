import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';
import { LikesService } from './likes.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  // private currentUserSource = new BehaviorSubject<User | null>(null); // BehaviorSubject allows us to create an observable with an initial value.
  // | denotes Union type where a thing can be more than one type.
  //currentUser$ = this.currentUserSource.asObservable();
  likeService = inject(LikesService);
  currentUser = signal<User | null>(null);
  roles = computed(() => {
    const user = this.currentUser();
    if (user && user.token){
      var role = JSON.parse(atob(user.token.split('.')[1])).role; // atob decodes the token. Token is split with '.' Token consists of 3 parts, we
      // are interested only in the payload, so index [1] gives us that.
      return Array.isArray(role) ? role : [role];
    }
    else{
      return [];
    }
  })
  constructor(private http: HttpClient) { }

  login(model: any){
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  register(model: any){
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((response: User) => {
        const user = response
        if (user)
        this.setCurrentUser(user);
        return user;
      })
    )
  }

  setCurrentUser(user: User){
        localStorage.setItem('user', JSON.stringify(user));
        // this.currentUserSource.next(user);
        this.currentUser.set(user);
        this.likeService.getLikeIds();
  }

  logout(){
    localStorage.removeItem('user');
    // this.currentUserSource.next(null);
    this.currentUser.set(null);
  }
}

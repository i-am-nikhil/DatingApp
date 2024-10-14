import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';
import { Photo } from '../_models/photo';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  baseUrl = environment.apiUrl;
  // members = signal<Member[]>([]);
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  memberCache = new Map();
  user = this.accountService.currentUser();
  userParams = signal<UserParams>(new UserParams(this.user));
  
  resetUserParams(){
    this.userParams.set(new UserParams(this.user));
  }

  getMembers(){

    // Check cache
    const response = this.memberCache.get(Object.values(this.userParams()).join('-')); // Joins all the values in userParams concatenated with '-', this acts as the key of the map.
    if (response) return setPaginatedResponse(response, this.paginatedResult);

    let params = setPaginationHeaders(this.userParams().pageNumber, this.userParams().pageSize);
    params = params.append('minAge', this.userParams().minAge);
    params = params.append('maxAge', this.userParams().maxAge);
    params = params.append('gender', this.userParams().gender);
    params = params.append('orderBy', this.userParams().orderBy);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).subscribe({
      next: response => {
        setPaginatedResponse(response, this.paginatedResult);
        this.memberCache.set(Object.values(this.userParams()).join('-'), response);
      }
    })
  }

  getMember(username: string){
    // const member = this.members().find(x => x.userName === username);
    // if(member !== undefined) return of(member);
    const member: Member = [...this.memberCache.values()]
                    .reduce((arr, elem) => arr.concat(elem.body), []) // simplified the response body that was stored in the values array
                    .find((m: Member) => m.userName === username);
    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
    //   tap(() => {
    //     this.members.update(members => members.
    //       map(m => m.userName === member.userName ? member : m))
    //   })
    )
  }

  setMainPhoto(photo: Photo){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photo.id, {}).pipe(
    //   tap(() => {
    //     this.members.update(members => members.map(m => {
    //       if (m.photos.includes(photo)){
    //         m.photoUrl = photo.url
    //       }
    //       return m;
    //     }))
    //   })
    )
  }

  deletePhoto(photo: Photo){
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photo.id).pipe(
      // tap(() => {
      //   this.members.update(members => members.map(m => {
      //     if (m.photos.includes(photo)){
      //       m.photos = m.photos.filter(p => p.id !== photo.id)
      //     }
      //     return m;
      //   }))
      // })
    )
  }

  // getHttpOptions(){
  //   return {
  //     headers: new HttpHeaders({
  //       Authorization: `Bearer ${this.accountService.currentUser()?.token}` // the backticks (``) are used for template literals in JavaScript, allowing you to embed expressions within strings.
  //     })
  //   }
  // }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginatedResult } from '../_models/pagination';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);
  toggleLike(targetId: number | undefined){
    if (targetId == undefined) return of(false);
    return this.http.post(`${this.baseUrl}likes/${targetId}`, {})
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number){
    let params = setPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    return this.http.get<Member[]>(`${this.baseUrl}likes`, {observe: 'response', params}).subscribe({
      next: response => setPaginatedResponse(response, this.paginatedResult)
    })
  }

  getLikeIds(){
    return this.http.get<number[]>(`${this.baseUrl}likes/list`)
      .subscribe({
        next: ids => this.likeIds.set(ids)
      })
  }
}

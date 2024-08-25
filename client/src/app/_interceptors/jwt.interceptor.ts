import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accountService = inject(AccountService);

    if (accountService.currentUser()) {
      request = request.clone({ // the original request that we receive is an immutable object. hence we must clone it to add authorization header.
        setHeaders: {
          Authorization: `Bearer ${accountService.currentUser()?.token}`
        }
      })
    }

    return next.handle(request);
  }
}

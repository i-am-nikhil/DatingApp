import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { state } from '@angular/animations';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const router = inject(Router);
    const toastr = inject(ToastrService);

    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch(error.status){
            case 400:
              if (error.error.errors){
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  if (error.error.errors[key]){
                    modalStateErrors.push(error.error.errors[key]);
                  }
                }
                throw modalStateErrors.flat();
              }
              else{
                
                toastr.error(error.error, error.status);
              }
              break;
            case 401:
              toastr.error('Unauthorised', error.status);
              break;
            case 404:
              router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}};
              router.navigateByUrl('/server-error', navigationExtras);
              break;
            default:
              toastr.error('Something unexpected went wrong');
          }
        }
        throw error;
      })
    );
  }
}

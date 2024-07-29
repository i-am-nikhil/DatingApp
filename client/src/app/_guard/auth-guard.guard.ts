import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

export const authGuardGuard: CanActivateFn = (route, state) => {
  var accountService = inject(AccountService);
  var toastr = inject(ToastrService);
  if(accountService.currentUser())
  {
    return true;
  }
  else
  {
    toastr.error('You shall not pass!');
    return false;
  }
};

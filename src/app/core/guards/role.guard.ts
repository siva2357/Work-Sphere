import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanMatch,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanMatch {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) { }

  canMatch(route: Route, segments: UrlSegment[]): boolean {
    if (!this.tokenService.isAuthenticated()) {
      return false;
    }

    const expectedRoles: string[] = route.data?.['expectedRoles'];
    const currentRole = (this.tokenService.getRole() || localStorage.getItem('role'))?.toLowerCase();

    if (!expectedRoles || (currentRole && expectedRoles.includes(currentRole))) {
      return true;
    }

    return false;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.tokenService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRoles: string[] = route.data['expectedRoles'];
    const currentRole = (this.tokenService.getRole() || localStorage.getItem('role'))?.toLowerCase();

    if (!expectedRoles || (currentRole && expectedRoles.includes(currentRole))) {
      return true;
    }

    if (currentRole === 'employee' || currentRole === 'hr') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }

    return false;
  }
}

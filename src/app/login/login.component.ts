import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { Subscription } from 'rxjs';

import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  showLoading: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigate(['/user', 'management']);
    } else {
      this.router.navigate(['/login']);
      console.log('abriendo login...');
    }
  }

  ngOnDestroy(): void {

  }

  onLogin(user: User): void {
    this.showLoading = true;
    console.log(user);
    const loginSub = this.authenticationService.login(user)
      .subscribe((resp: HttpResponse<User>) => {
        const token = resp.headers.get('Jwt-Token');
        this.authenticationService.saveToken(token!);
        this.authenticationService.addUserToLocalCache(resp.body!);
        this.router.navigate(['/user', 'management']);
        this.showLoading = false;
      });

    this.subscriptions.push(loginSub);
  }
}

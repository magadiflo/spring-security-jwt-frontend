import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationType } from '../enum/notification-type.enum';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  /**
   ** BehaviorSubject, es un tipo de Observable que emite múltiples valores a uno 
   ** o muchos Observers. Sus características son:
   ** - Requiere un valor inicial, por que siempre debe devolver
   **   un valor en el momento de la subscripción, incluso si no ha recibido el next().
   ** - Después de subscribirse, devuelve el último valor del tema.
   ** - Puede utilizar el método getvalue () en cualquier momento para recuperar el último 
   **   valor del tema en código no observable.
   ** El signo $, es una convención para declarar un observable
   */
  private titleSubject = new BehaviorSubject<string>('Users');
  private subscriptions: Subscription[] = [];

  titleAction$ = this.titleSubject.asObservable();
  users: User[] = [];
  refreshing: boolean = false;
  selectedUser!: User;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.getUsers(true);
  }

  changeTitle(title: string): void {
    //*Así cambiamos el valor
    this.titleSubject.next(title);
  }

  getUsers(showNotification: boolean): void {
    this.refreshing = true;
    const userSubscription = this.userService.getUsers()
      .subscribe({
        next: (resp: User[]) => {
          this.userService.addUsersToLocalCache(resp);
          this.users = resp;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${resp.length} user(s) loaded successfully`);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, err.error.message);
          this.refreshing = false;
        }
      });

    this.subscriptions.push(userSubscription);
  }

  onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    document.getElementById('openUserInfo')?.click();
  }

  onProfileImageChange(event: any): void {
    console.log(event);
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (!message) {
      message = 'An error ocurred. Please, try again';
    }
    this.notificationService.notify(notificationType, message);
  }

}

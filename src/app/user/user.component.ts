import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationType } from '../enum/notification-type.enum';
import { CustomHttpResponse } from '../model/custom-http-response';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { AuthenticationService } from '../service/authentication.service';

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
  private currentUsername!: string;

  titleAction$ = this.titleSubject.asObservable();
  refreshing: boolean = false;
  fileName: string = '';
  profileImage: File | null = null;
  users: User[] = [];
  selectedUser!: User;
  editUser: User = new User();
  user!: User;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private router: Router) { }

  ngOnInit(): void {
    this.loadUserFromCache();
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
    this.clickButton('openUserInfo');
  }

  onProfileImageChange(event: Event): void {
    const target = (event.target as HTMLInputElement);
    this.fileName = target.files![0].name;
    this.profileImage = target.files![0];
  }

  saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  onAddNewUser(userForm: NgForm): void {
    const formData: FormData = this.userService.createUserFromData('', userForm.value, this.profileImage!);
    const userSaveSubscription = this.userService.addUser(formData)
      .subscribe({
        next: (user: User) => {
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          userForm.reset();
          userForm.form.controls['role'].setValue('ROLE_USER'); //by default
          this.sendNotification(NotificationType.SUCCESS, `${user.firstName} ${user.lastName} added successfully`);
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, err.error.message);
          this.profileImage = null;
        }
      });

    this.subscriptions.push(userSaveSubscription);
  }

  searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache() || []) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache() || [];
    }
  }

  onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  onUpdateUser(): void {
    const formData: FormData = this.userService.createUserFromData(this.currentUsername, this.editUser, this.profileImage!);
    const userUpdateSubscription = this.userService.updateUser(formData)
      .subscribe({
        next: (user: User) => {
          this.clickButton('close-edit-user-modal-button');
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          this.sendNotification(NotificationType.SUCCESS, `${user.firstName} ${user.lastName} updated successfully`);
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, err.error.message);
          this.profileImage = null;
        }
      });

    this.subscriptions.push(userUpdateSubscription);
  }

  onDeleteUser(user: User): void {
    if (!confirm(`¿You want delete the user ${user.firstName} ${user.lastName}?`)) {
      return;
    }
    const userDeleteSubscription = this.userService.deleteUser(user.id!)
      .subscribe({
        next: (resp: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, resp.message);
          this.getUsers(false);
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, err.error.message);
        }
      });

    this.subscriptions.push(userDeleteSubscription);
  }

  onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAdress = emailForm.controls['reset-password-email'].value;
    const userResetPassSubscription = this.userService.resetPassword(emailAdress)
      .subscribe({
        next: (resp: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, resp.message);
          this.refreshing = false;
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, err.error.message);
          this.refreshing = false;
        },
        complete: () => emailForm.reset()
      });

    this.subscriptions.push(userResetPassSubscription);
  }

  onUpdateCurrentUser(profileForm: NgForm): void {
    this.refreshing = true;
    this.currentUsername = this.authenticationService.getUserFromLocalCache().username;
    const formData: FormData = this.userService.createUserFromData(this.currentUsername, profileForm.value, this.profileImage!);
    const userUpdateSubscription = this.userService.updateUser(formData)
      .subscribe({
        next: (user: User) => {
          this.authenticationService.addUserToLocalCache(user);
          this.loadUserFromCache();
          this.getUsers(false);
          this.fileName = '';
          this.profileImage = null;
          this.refreshing = false;
          this.sendNotification(NotificationType.SUCCESS, `${user.firstName} ${user.lastName} updated successfully`);
        },
        error: (err: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, err.error.message);
          this.profileImage = null;
          this.refreshing = false;
        }
      });

    this.subscriptions.push(userUpdateSubscription);
  }

  onLogout(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
  }

  updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  onUpdateProfileImage(): void {

  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (!message) {
      message = 'An error ocurred. Please, try again';
    }
    this.notificationService.notify(notificationType, message);
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }

  private loadUserFromCache(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
  }

}

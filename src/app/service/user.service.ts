import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../model/user';

const HOST: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${HOST}/user/list`);
  }

  addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${HOST}/user/add`, formData);
  }

  updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${HOST}/user/update`, formData);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.get<any>(`${HOST}/user/reset-password/${email}`);
  }

}

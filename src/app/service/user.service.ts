import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
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

  /**
   ** reportProgress: true, mostrará algún progreso de cualquier solicitud HTTP.
   ** observe: 'events', debemos usar esta opción si deseamos ver todos los eventos, 
   **     incluido el progreso de las transferencias. Además, debemos devolver 
   **     un Observable de tipo HttpEvent.
   */
  updateProfileImage(formData: FormData): Observable<HttpEvent<any>> {
    return this.http.post<User>(`${HOST}/user/update-profile-image`, formData, { reportProgress: true, observe: 'events' });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${HOST}/user/delete/${userId}`);
  }

}

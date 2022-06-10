import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../model/user';

const HOST: string = environment.apiUrl;
const USER: string = 'user';
const USERS: string = 'users';
const TOKEN: string = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private token: string = '';
  private loggedInUsername: string = '';

  constructor(private http: HttpClient) { }

  login(user: User): Observable<HttpResponse<User>> {
    //*observe: 'response', significa que HttpClient devolverá toda la respuesta completa, 
    //*incluyendo encabezados y todo. Esto lo hacemos por que el token que nos devuelve el backend 
    //*viene en el encabezado, y si no ponemos esa opción por defecto solo nos devolverá el cuerpo de la petición.
    //*Como resultado, devuelve un Observable de tipo HttpResponse en lugar de solo los datos JSON contenidos en el cuerpo.
    return this.http.post<User>(`${HOST}/user/login`, user, { observe: 'response' });
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${HOST}/user/register`, user);
  }

  logOut(): void {
    this.token = '';
    this.loggedInUsername = '';
    localStorage.removeItem(USER);
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(USERS);
  }

  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN, token);
  }

  addUserToLocalCache(user: User): void {
    localStorage.setItem(USER, JSON.stringify(user));
  }

}

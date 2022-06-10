import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../model/user';

const HOST: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  login(user: User): Observable<HttpResponse<any> | HttpErrorResponse> {
    //*observe: 'response', significa que HttpClient devolverá toda la respuesta completa, 
    //*incluyendo encabezados y todo. Esto lo hacemos por que el token que nos devuelve el backend 
    //*viene en el encabezado, y si no ponemos esa opción por defecto solo nos devolverá el cuerpo de la petición.
    //*Como resultado, devuelve un Observable de tipo HttpResponse en lugar de solo los datos JSON contenidos en el cuerpo.
    return this.http.post<HttpResponse<any> | HttpErrorResponse>(`${HOST}/user/login`, user, { observe: 'response' }); 
  }

}

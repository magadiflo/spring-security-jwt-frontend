import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  titleAction$ = this.titleSubject.asObservable();

  constructor() { }

  ngOnInit(): void {
  }

  changeTitle(title: string): void {
    //*Así cambiamos el valor
    this.titleSubject.next(title);
  }

}

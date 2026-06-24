import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { HabitacionRequest, HabitacionResponse } from '../models/Habitacion.model';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {


  private apiUrl: string = environment.apiHabitaciones;

  constructor(private http: HttpClient) { }

  getHabitaciones(): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(this.apiUrl).pipe(
      map(habitaciones => habitaciones.sort()),
      catchError(error => {
        console.error('Error al obtener las habitaciones', error);
        return of([]);
      })
    );
  }

  postHabitaciones(habitacion: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(this.apiUrl, habitacion).pipe(
      catchError(error => {
        console.error('Error al registrar la habitacion', error);
        return throwError(() => error);
      })
    );
  }

  putHabitaciones(habitacion: HabitacionRequest, habitacionId: string): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${this.apiUrl}/${habitacionId}`, habitacion).pipe(
      catchError(error => {
        console.error('Error al actualizar la habitacion', error);
        return throwError(() => error);
      })
    );
  }

  deleteHabitaciones(habitacionId: string): Observable<HabitacionResponse> {
    return this.http.delete<HabitacionResponse>(`${this.apiUrl}/${habitacionId}`).pipe(
      catchError(error => {
        console.error('Error al eliminar la habitacion', error);
        return throwError(() => error);
      })
    );
  }
}

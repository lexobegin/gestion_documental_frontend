import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token'; //access
  private refreshKey = 'refresh';

  constructor(private http: HttpClient, private router: Router) {}

  // Login: solo almacena el token
  /*login(correo: string, contrasena: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { correo, contrasena })
      .pipe(
        tap((response: any) => {
          this.setToken(response.token); // Solo guarda el token
        })
      );
  }*/

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/token/`, { email, password })
      .pipe(
        tap((response: any) => {
          this.setToken(response.access); // Solo guarda el token "access"
          this.setRefresh(response.refresh); // Solo guarda el "refresh"
        })
      );
  }

  // Logout: borra los datos de autenticación y redirige al login
  logout(): Observable<any> {
    const refresh = this.getRefresh();
    const access = this.getToken();
    if (!refresh || !access) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.http
      .post(
        `${environment.apiUrl}/token/blacklist/`,
        { refresh },
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      )
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        })
      );
  }

  // Verifica si el usuario está autenticado comprobando la existencia del token
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obtiene el token almacenado en el localStorage //"access"
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Guarda el token en el localStorage //"access"
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtiene el refresh almacenado en el localStorage
  getRefresh(): string | null {
    return localStorage.getItem(this.refreshKey);
  }

  // Guarda el refresh en el localStorage
  private setRefresh(refresh: string): void {
    localStorage.setItem(this.refreshKey, refresh);
  }

  // Elimina los datos de autenticación almacenados
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey); // access
    localStorage.removeItem(this.refreshKey); // refresh
  }
}

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
  private userKey = 'user_data';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/login/`, { email, password })
      .pipe(
        tap((response: any) => {
          this.setToken(response.access);
          this.setRefresh(response.refresh);
          
          if (response.user) {
            this.setUserData(response.user);
          }
        })
      );
  }

  // Logout: borra los datos de autenticación y redirige al login
  logout(): Observable<any> {
    const refresh = this.getRefresh();
    
    if (!refresh) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }

    return this.http
      .post(`${environment.apiUrl}/logout/`, { refresh_token: refresh })
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        })
      );
  }

  // Método para registrar intentos fallidos de login (mantenido pero sin endpoint público)
  registrarIntentoFallido(email: string): void {
    // Solo registro en consola para desarrollo
    console.warn('Intento fallido de login para:', email);
    // El registro real en bitácora se hace automáticamente en el backend
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

  // Guarda los datos del usuario en el localStorage
  private setUserData(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Obtiene los datos del usuario del localStorage
  getUserData(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Elimina los datos de autenticación almacenados
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey); // access
    localStorage.removeItem(this.refreshKey); // refresh
    localStorage.removeItem(this.userKey); // user data
  }

  // Método para refrescar el token
  refreshToken(): Observable<any> {
    const refresh = this.getRefresh();
    return this.http.post(`${environment.apiUrl}/token/refresh/`, {
      refresh: refresh
    }).pipe(
      tap((response: any) => {
        this.setToken(response.access);
      })
    );
  }
}
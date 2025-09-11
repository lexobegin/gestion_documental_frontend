import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment'; // ← OJO: 3 niveles arriba porque estás en /interceptors/auth/

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Usa SOLO apiUrl (es la que tienes definida en tus environments)
    const apiBase = environment.apiUrl || '';

    // Detecta llamadas a tu API (absolutas o relativas)
    const isApiUrl = request.url.startsWith(apiBase) || request.url.startsWith('/api/');
    // Normaliza el path para detectar los endpoints de auth
    const path = request.url.startsWith(apiBase) ? request.url.slice(apiBase.length) : request.url;

    // No adjuntar token en auth (login / refresh / blacklist)
    const isAuthEndpoint =
      isApiUrl && (
        path.startsWith('/token/') ||
        path.startsWith('/token/refresh/') ||
        path.startsWith('/token/blacklist/')
      );

    if (!isApiUrl || isAuthEndpoint) {
      return next.handle(request);
    }

    // Adjuntar Bearer si existe
    const token = this.authService.getToken(); // debe devolver el access JWT
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request);
  }
}

import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpRequest,
  } from '@angular/common/http';
  import { inject } from '@angular/core';
  import { AuthStateService } from '../data-access/auth-state.service';
  import { catchError, throwError } from 'rxjs';
  import { Router } from '@angular/router';
  
  export const authInterceptor: HttpInterceptorFn = (
    request: HttpRequest<any>, // Solicitud HTTP que va a ser interceptada
    next: HttpHandlerFn        // Función que sigue la cadena de manejo HTTP
  ) => {
    const authState = inject(AuthStateService);
  
    const router = inject(Router);
  
    // Obtener el token de acceso desde el servicio de autenticación
    const token = authState.getSession();
  
    // Clonación de la solicitud para agregar el encabezado de autorización
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    });
  
    // Enviar la solicitud modificada, cierra sesión y redirige al /auth/log-in
    return next(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          authState.signOut();
          router.navigateByUrl('/auth/log-in');
        }
  
        return throwError(() => error);
      })
    );
  };
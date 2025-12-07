import {
    CanActivate,
    ExecutionContext,
    Injectable,
    SetMetadata,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  // Clave para el decorador @Public
  export const IS_PUBLIC_KEY = 'isPublic';

  // Decorador para marcar una ruta como pública
  export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);


  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private reflector: Reflector,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {

      // Obtiene el valor de la clave IS_PUBLIC_KEY
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      // Si la ruta es pública, devuelve true
      if (isPublic) {
        return true;
      }
      
      // Obtiene la petición del contexto 
      const request = context.switchToHttp().getRequest();
      
      // Comprueba si el token es válido
      const token = this.extractToken(request);
      
      // Si no hay token, lanza UnauthorizedException
      if (!token) {
        throw new UnauthorizedException();
      }
  
      // Verifica si el token es correcto y lo añade al objeto request
      try {

        // Verifica el token con la clave SECRET
        const payload = await this.jwtService.verifyAsync(token, {
          secret: (process.env.JWT_SECRET || '').replace(/"/g, ''), // <-- Elimina comillas dobles
        });

        request['user'] = payload;

      } catch (error) {
        throw new UnauthorizedException();
      }
  
      return true;
    }
  
    // Extrae el token del header de la petición
    private extractToken(request: Request): string | undefined {

      // Obtiene el tipo y el token del header de la petición
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      
      // Devuelve el token si el tipo es 'Bearer', de lo contrario devuelve undefined
      return type === 'Bearer' ? token : undefined;
    }
  }
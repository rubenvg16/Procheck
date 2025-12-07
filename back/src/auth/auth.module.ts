import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './guards/auth.guard';
import { Loginclientes } from 'src/entitiesies/clientes/entities/Loginclientes';
import { GoogleStrategy } from './strategies/google.strategy';
import { Usuarios } from 'src/entitiesies/checklist_online/entities/Usuarios';

@Module({
  imports: [
    // Registramos la entidad Loginclientes
    TypeOrmModule.forFeature([Loginclientes], 'clientesConnection'),
    TypeOrmModule.forFeature([Usuarios], 'checklistsConnection'),
    // Configuramos el módulo Jwt
    JwtModule.register({
      secret: (process.env.JWT_SECRET || 'default_secret').replace(/"/g, ''), // <-- Elimina comillas dobles
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, AuthGuard, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
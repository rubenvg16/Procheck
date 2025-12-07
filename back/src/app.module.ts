import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DashboardModule } from './dashboard/dashboard.module';
import { Loginclientes } from './entitiesies/clientes/entities/Loginclientes';
import { Conexionesbd } from './entitiesies/clientes/entities/Conexionesbd';
import { Licencias } from './entitiesies/clientes/entities/Licencias';
import { Entradas } from './entitiesies/checklist_online/entities/Entradas';
import { Listas } from './entitiesies/checklist_online/entities/Listas';
import { Permisosclientes } from './entitiesies/clientes/entities/Permisosclientes';
import { ChecklistService } from './checklist/checklist.service';
import { ChecklistModule } from './checklist/checklist.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { Usuarios } from './entitiesies/checklist_online/entities/Usuarios';
import { Respuestas } from './entitiesies/checklist_online/entities/Respuestas';
import { SearchService } from './search/search.service';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';
import { EntradasModule } from './entradas/entradas.module';

@Module({
  imports: [
    AuthModule,
    // Conexión a la base de datos de clientes (lee desde env)
    TypeOrmModule.forRoot({
      name: 'clientesConnection',
      type: 'mysql',
      host: process.env.CLIENTES_DB_HOST || 'localhost',
      port: process.env.CLIENTES_DB_PORT ? Number(process.env.CLIENTES_DB_PORT) : 3306,
      username: process.env.CLIENTES_DB_USER || 'root',
      password: process.env.CLIENTES_DB_PASS || 'secret',
      database: process.env.CLIENTES_DB_NAME || 'clientes',
      autoLoadEntities: true,
      synchronize: false,
    }),
    // Conexión a la base de datos de checklists (lee desde env)
    TypeOrmModule.forRoot({
      name: 'checklistsConnection',
      type: 'mysql',
      host: process.env.CHECKLIST_DB_HOST || 'localhost',
      port: process.env.CHECKLIST_DB_PORT ? Number(process.env.CHECKLIST_DB_PORT) : 3306,
      username: process.env.CHECKLIST_DB_USER || 'root',
      password: process.env.CHECKLIST_DB_PASS || 'secret',
      database: process.env.CHECKLIST_DB_NAME || 'checklist_online',
      autoLoadEntities: true,
      synchronize: false,
    }),
    // Registrar las entidades para la base de datos de clientes
    TypeOrmModule.forFeature([Permisosclientes, Loginclientes, Conexionesbd, Licencias], 'clientesConnection'),
    // Registrar las entidades para la base de datos de checklists
    TypeOrmModule.forFeature([Entradas, Listas, Usuarios, Respuestas], 'checklistsConnection'),
    
    // Configuración de JWT
    JwtModule.register({
      global: true,
      secret: process.env.SECRET || process.env.JWT_SECRET || 'supersecreto',
      signOptions: { expiresIn: '24h' },
    }),

    // Módulo de dashboard
    DashboardModule,

    ChecklistModule,

    UserModule,

    SearchModule,

    EntradasModule,
  ],
  exports: [TypeOrmModule], 
  controllers: [AppController, SearchController],
  providers: [AppService, ChecklistService, UserService, SearchService],
}) 
export class AppModule {}

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { Conexionesbd } from 'src/entitiesies/clientes/entities/Conexionesbd';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { Usuarios } from 'src/entitiesies/checklist_online/entities/Usuarios';
import { DashboardModule } from 'src/dashboard/dashboard.module';


@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Permisosclientes,  Conexionesbd], 
      'clientesConnection'
    ),
    TypeOrmModule.forFeature(
      [Listas, Entradas, Usuarios], 
      'checklistsConnection'
    ),
    DashboardModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

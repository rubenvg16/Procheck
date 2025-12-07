import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { Conexionesbd } from 'src/entitiesies/clientes/entities/Conexionesbd';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';

@Module({
  // Registramos la entidad Loginclientes
  imports: [
    TypeOrmModule.forFeature(
      [Permisosclientes,  Conexionesbd], 
      'clientesConnection'
    ),
    TypeOrmModule.forFeature(
      [Listas, Entradas], 
      'checklistsConnection'
    ),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],  
})
export class DashboardModule {}

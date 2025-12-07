import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { Conexionesbd } from 'src/entitiesies/clientes/entities/Conexionesbd';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

@Module({
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
  controllers: [ChecklistController],
  providers: [ChecklistService],
})
export class ChecklistModule {}

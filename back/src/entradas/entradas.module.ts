import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entradas } from '../entitiesies/checklist_online/entities/Entradas';
import { Listas } from '../entitiesies/checklist_online/entities/Listas';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';
import { ListasController } from '../listas/listas.controller';
import { Respuestas } from 'src/entitiesies/checklist_online/entities/Respuestas';


@Module({
  imports: [
    TypeOrmModule.forFeature([Entradas, Listas, Respuestas], 'checklistsConnection'),
    TypeOrmModule.forFeature([Permisosclientes], 'clientesConnection'),
  ],
  controllers: [EntradasController, ListasController],
  providers: [EntradasService],
})
export class EntradasModule {}

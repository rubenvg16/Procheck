import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Respuestas } from 'src/entitiesies/checklist_online/entities/Respuestas';
import { Usuarios } from 'src/entitiesies/checklist_online/entities/Usuarios';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature(
          [], 
          'clientesConnection'
        ),
        TypeOrmModule.forFeature(
          [Respuestas, Usuarios, Listas, Entradas], 
          'checklistsConnection'
        ),
        UserModule,
      ],
    providers: [SearchService],
    controllers: [SearchController],
    exports: [SearchService],
})
export class SearchModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Repository } from 'typeorm';

interface Entrada {
  nombre: string;
  tipo: string;
}

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Listas, 'checklistsConnection')
    private listasRepository: Repository<Listas>,
    @InjectRepository(Entradas, 'checklistsConnection')
    private entradasRepository: Repository<Entradas>,
  ) { }

  async postChecklist(nombresLocales: string[], nombreLista: string, entradas: Entrada[]) {
    if (!Array.isArray(entradas)) {
      console.error('El parámetro "entradas" no es un array:', entradas);
      return { error: '"entradas" debe ser un array.' };
    }

    if (!Array.isArray(nombresLocales) || nombresLocales.length === 0) {
      return { error: 'Debe seleccionar al menos un local.' };
    }

    const results: { local: string; status: string; error?: string }[] = [];
    
    // Crear una checklist para cada local seleccionado
    for (const nombreLocal of nombresLocales) {
      try {
        // Crear y guardar la checklist
        const newChecklist = this.listasRepository.create({
          nombre: nombreLista,
          local: nombreLocal,
          alta: 1,
        });

        await this.listasRepository.save(newChecklist);

        // Guardar las entradas asociadas a la checklist
        for (const [i, entrada] of entradas.entries()) {
          const newEntrada = this.entradasRepository.create({
            nombre: entrada.nombre,
            tipo: entrada.tipo,
            idlista: Number(newChecklist.idlista),
            orden: i + 1,
          });
          await this.entradasRepository.save(newEntrada);
        }

        results.push({
          local: nombreLocal,
          status: 'success',
        });
      } catch (error) {
        results.push({
          local: nombreLocal,
          status: 'error',
          error: error.message
        });
      }
    }

    return { 
      message: 'Proceso de creación de checklists completado', 
      results 
    };
  }


}

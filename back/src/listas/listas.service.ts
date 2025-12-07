import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listas } from '../entitiesies/checklist_online/entities/Listas';
import { Entradas } from '../entitiesies/checklist_online/entities/Entradas';

@Injectable()
export class ListasService {
  constructor(
    @InjectRepository(Listas, 'checklistsConnection')
    private readonly listasRepo: Repository<Listas>,
    @InjectRepository(Entradas, 'checklistsConnection')
    private readonly entradasRepo: Repository<Entradas>,
  ) {}

  // ...existing code...

  async updateListaFullMultiple(idLista: number, body: any) {
    // 1. Obtener la lista actual
    const currentLista = await this.listasRepo.findOne({ 
      where: { idlista: idLista.toString() } 
    });
    
    if (!currentLista) {
      throw new NotFoundException(`Lista con ID ${idLista} no encontrada`);
    }

    // 2. Actualizar lista actual
    await this.listasRepo.update({ idlista: idLista.toString() }, {
      nombre: body.nombre,
      local: body.locales[0], // El primer local se guarda en la lista original
      alta: body.alta ? 1 : 0
    });

    // 3. Eliminar entradas existentes de la lista original
    await this.entradasRepo.delete({ idlista: idLista });

    // 4. Insertar nuevas entradas con orden correcto para la lista original
    for (const [idx, entrada] of body.entradas.entries()) {
      await this.entradasRepo.insert({
        idlista: idLista,
        orden: idx + 1,
        nombre: entrada.nombre,
        tipo: entrada.tipo
      });
    }

    // 5. Para cada local adicional, crear una nueva lista con las mismas entradas
    for (let i = 1; i < body.locales.length; i++) {
      const localName = body.locales[i];
      
      // 5.1 Verificar si ya existe una lista con el mismo nombre y local
      const existingLista = await this.listasRepo.findOne({
        where: { 
          nombre: body.nombre,
          local: localName
        }
      });

      if (existingLista) {
        // 5.2 Si existe, actualizar y reemplazar entradas
        await this.listasRepo.update({ idlista: existingLista.idlista }, {
          alta: body.alta ? 1 : 0
        });
        
        await this.entradasRepo.delete({ idlista: parseInt(existingLista.idlista) });
        
        for (const [idx, entrada] of body.entradas.entries()) {
          await this.entradasRepo.insert({
            idlista: parseInt(existingLista.idlista),
            orden: idx + 1,
            nombre: entrada.nombre,
            tipo: entrada.tipo
          });
        }
      } else {
        // 5.3 Si no existe, crear nueva lista con entradas
        const newLista = this.listasRepo.create({
          nombre: body.nombre,
          local: localName,
          alta: body.alta ? 1 : 0
        });
        const savedLista = await this.listasRepo.save(newLista);
        
        for (const [idx, entrada] of body.entradas.entries()) {
          await this.entradasRepo.insert({
            idlista: parseInt(savedLista.idlista),
            orden: idx + 1,
            nombre: entrada.nombre,
            tipo: entrada.tipo
          });
        }
      }
    }

    return { success: true };
  }

  // ...existing code...
}
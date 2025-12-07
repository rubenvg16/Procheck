import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entradas } from '../entitiesies/checklist_online/entities/Entradas';
import { Listas } from '../entitiesies/checklist_online/entities/Listas';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { UpdateEntradaDto } from './updateEntradaDto.dto';
import { UpdateListaDto } from '../listas/updateListaDto.dto';
import { CreateEntradaDto } from './createEntradaDto.dto';
import { Respuestas } from 'src/entitiesies/checklist_online/entities/Respuestas';

@Injectable()
export class EntradasService {
  constructor(
    @InjectRepository(Entradas, 'checklistsConnection')
    private readonly entradaRepo: Repository<Entradas>,
    @InjectRepository(Listas, 'checklistsConnection')
    private readonly listasRepo: Repository<Listas>,
    @InjectRepository(Permisosclientes, 'clientesConnection')
    private readonly permisosClientesRepo: Repository<Permisosclientes>,
    @InjectRepository(Respuestas, 'checklistsConnection')
    private readonly respuestasRepo: Repository<Respuestas>,
  ) { }//inyeccion de repositorios de entradas, listas y permisosclientes
  //para poder acceder a las entidades y realizar operaciones CRUD

  findAll(): Promise<Entradas[]> {
    return this.entradaRepo.find();
  }//devuelve todas las entradas de la BD

  async findByListaId(idLista: number) {
    return this.entradaRepo.find({
      where: { idlista: idLista },
      order: { orden: 'ASC' },
    });
  }//devuelve todas las entradas de una lista especifica, ordenadas por orden

  async getLocales(email: string): Promise<string[]> {
    const query = `
      SELECT conexionesbd.NombreConexion
      FROM permisosclientes
      INNER JOIN conexionesbd ON conexionesbd.IdConexion = permisosclientes.IDConexion
      WHERE permisosclientes.Cliente = ? AND permisosclientes.App = "Checklists"
    `;

    //usar clientesConnection en vez de checklistsConnection
    const result = await this.permisosClientesRepo.query(query, [email]);
    return result.map((row: { NombreConexion: string }) => row.NombreConexion);
  }//devuelve los locales a los que tiene acceso el cliente(email), usando un query SQL directo

  async updateEntrada(id: number, updateEntradaDto: UpdateEntradaDto) {
    await this.entradaRepo.update(id, updateEntradaDto);
    return this.entradaRepo.findOne({ where: { orden: id } });
  }//actualiza entrada por su ID y devuelve entrada actualizada

  async getListaDetails(idLista: number) {
    const lista = await this.listasRepo.findOne({
      where: { idlista: idLista.toString() }
    });

    if (!lista) {
      throw new NotFoundException(`Lista con ID ${idLista} no encontrada`);
    }

    return lista;
  }//busca lista por ID, sino encuentra excepcion, si encuentra devuelve lista(detalles)

  async updateLista(idLista: number, updateListaDto: UpdateListaDto) {
    // Convertir alta a 0 o 1 para la BD
    const altaValue = updateListaDto.alta !== undefined ? (updateListaDto.alta ? 1 : 0) : undefined;

    const result = await this.listasRepo.update(
      { idlista: idLista.toString() },
      { ...updateListaDto, alta: altaValue }, // usar valor convertido aqui
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Lista con ID ${idLista} no encontrada`);
    }

    return this.getListaDetails(idLista);
  }//actualiza datos de una lista, devuelve detalles de lista actualziada

  async deleteEntrada(idlista: number, orden: number): Promise<void> {
    const entrada = await this.entradaRepo.findOne({ where: { idlista, orden } });
    if (!entrada) {
      throw new NotFoundException(`Entrada con idlista ${idlista} y orden ${orden} no encontrada`);
    }
    await this.entradaRepo.remove(entrada);
  }//elimina entrada por idLista y orden

  async addEntrada(idLista: number, createEntradaDto: CreateEntradaDto): Promise<Entradas> {
    const entrada = this.entradaRepo.create({ ...createEntradaDto, idlista: idLista });
    return this.entradaRepo.save(entrada);
  }//crea y guarda una nueva entrada asociada a una lista

  async updateListaFull(idLista: number, body: any) {
    // 1. actualiza lista
    await this.listasRepo.update({ idlista: idLista.toString() }, {
      nombre: body.nombre,
      local: body.local,
      alta: body.alta ? 1 : 0
    });

    // 2. elimina entradas existentes
    await this.entradaRepo.delete({ idlista: idLista });

    // 3. insertar nuevas entradas con orden correcto
    for (const [idx, entrada] of body.entradas.entries()) {
      await this.entradaRepo.insert({
        idlista: idLista,
        orden: idx + 1,
        nombre: entrada.nombre,
        tipo: entrada.tipo
      });
    }

    return { success: true };
  }

  async guardarRespuestas(body: any) {
    const { idLista, localLista, user, respuestas } = body; // Extrae del objeto recibido: el id de la lista, el nombre del local, el usuario y el array de respuestas.
    const fecha = new Date(); // Obtiene la fecha y hora actual para registrar cuando se guardan las respuestas.
    for (const r of respuestas) { // Recorre cada respuesta enviada en el array.
      await this.respuestasRepo.save({// Guarda cada respuesta en la tabla 'respuestas' de la base de datos.
        fecha,           // Fecha y hora de la respuesta.
        idLista,         // ID de la lista a la que pertenece la respuesta.
        orden: r.orden,  // Orden de la entrada dentro de la lista.
        local: localLista, // Nombre del local.
        usuario: user,     // Usuario que responde.
        tipo: r.tipo,      // Tipo de entrada (texto, casilla, observacion, etc).
        valor: r.valor     // Valor ingresado o marcado por el usuario.
      });
    }
  }

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
    await this.entradaRepo.delete({ idlista: idLista });

    // 4. Insertar nuevas entradas con orden correcto para la lista original
    for (const [idx, entrada] of body.entradas.entries()) {
      await this.entradaRepo.insert({
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

        await this.entradaRepo.delete({ idlista: parseInt(existingLista.idlista) });

        for (const [idx, entrada] of body.entradas.entries()) {
          await this.entradaRepo.insert({
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
          await this.entradaRepo.insert({
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

  async duplicateLista(idLista: number, targetLocal: string) {
    // 1. Get the original checklist
    const original = await this.listasRepo.findOne({ where: { idlista: idLista.toString() } });
    if (!original) throw new NotFoundException('Checklist original no encontrada');

    // 2. Create the new checklist
    const newChecklist = this.listasRepo.create({
      nombre: original.nombre,
      local: targetLocal,
      alta: 1,
    });
    await this.listasRepo.save(newChecklist);

    // 3. Get all entries from the original checklist
    const entradas = await this.entradaRepo.find({ where: { idlista: idLista } });

    // 4. Duplicate each entry for the new checklist
    for (const entrada of entradas) {
      const newEntrada = this.entradaRepo.create({
        ...entrada,
        idlista: Number(newChecklist.idlista), // convertir a number
        orden: entrada.orden,
        // Remove primary key if needed
      });
      delete (newEntrada as any).id; // If you have an auto-generated PK
      await this.entradaRepo.save(newEntrada);
    }

    return { message: 'Checklist duplicada correctamente' };
  }

}
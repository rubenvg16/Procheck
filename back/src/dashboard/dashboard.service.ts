import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Conexionesbd } from 'src/entitiesies/clientes/entities/Conexionesbd';
import { Loginclientes } from 'src/entitiesies/clientes/entities/Loginclientes';
import { Permisosclientes } from 'src/entitiesies/clientes/entities/Permisosclientes';
import { In, Repository } from 'typeorm';

interface Entrada {
  nombre: string;
  tipo: string;
}



@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Permisosclientes, 'clientesConnection')
    private permisosclientesRepository: Repository<Permisosclientes>,
    @InjectRepository(Conexionesbd, 'clientesConnection')
    private conexionesbdRepository: Repository<Conexionesbd>,
    @InjectRepository(Listas, 'checklistsConnection')
    private listasRepository: Repository<Listas>,
    @InjectRepository(Entradas, 'checklistsConnection')
    private entradasRepository: Repository<Entradas>,
  ) { }

  async decodeToken(token: string): Promise<string | undefined> {
    if (!token) {
      console.log('Token no encontrado');
      return undefined;
    }

    try {
      const decoded = jwt.decode(token);
      return typeof decoded === 'object' && decoded !== null ? decoded['nombre'] : undefined;
    } catch (error) {
      console.error('Error al decodificar el token', error);
      return undefined;
    }
  }

  async getPermisos(nombre: string): Promise<any> {
    try {
      // Obtener todos los permisos de tipo 'Login' y valor 'S'
      const permisos = await this.permisosclientesRepository.find({
        where: {
          cliente: nombre,
          app: 'Checklists',
          permiso: 'Login',
          valor: 'S',
        },
      });
  
      if (!permisos || permisos.length === 0) {
        console.log('Permisos no encontrados');
        return { error: 'Permisos no encontrados' };
      }
  
      return permisos; // Devuelve todos los permisos encontrados
    } catch (error) {
      console.error('Error al buscar permisos', error);
      return { error: 'Error al buscar permisos' };
    }
  }
  
  async buscarConexiones(idConexiones: string[] | number[]): Promise<any> {
    try {
      // Asegurar que los IDs sean números
      const numericIds = idConexiones.map(id => Number(id)).filter(id => !isNaN(id));
      
      console.log('Buscando conexiones con IDs:', numericIds);
      
      if (numericIds.length === 0) {
        console.log('No hay IDs válidos para buscar');
        return { error: 'No hay IDs válidos' };
      }

      // Buscar todas las conexiones asociadas a los ids proporcionados
      const conexiones = await this.conexionesbdRepository.find({
        where: {
          idConexion: In(numericIds),
        },
      });

      console.log('Conexiones encontradas en BD:', conexiones);

      if (!conexiones || conexiones.length === 0) {
        console.log('Ninguna conexión encontrada para los IDs:', numericIds);
        return { error: 'Ninguna conexión encontrada' };
      }

      return conexiones;
    } catch (error) {
      console.error('Error al buscar conexiones:', error);
      return { error: 'Error al buscar conexiones' };
    }
  }
  
  async getConexiones(token: string) {
    const nombre = await this.decodeToken(token);

    if (!nombre) {
      return { error: 'Token no válido' };
    }

    // Obtener todos los permisos
    const permisos = await this.getPermisos(nombre);
    if (permisos?.error) {
      console.log('Sin permisos encontrados para el usuario:', nombre);
      return permisos;
    }

    // Log para debugging
    console.log('Permisos encontrados:', permisos);

    // Obtener las conexiones correspondientes a todos los permisos encontrados
    const idsConexion = permisos.map(permiso => permiso.idConexion);
    console.log('IDs de conexión a buscar:', idsConexion);
    
    const conexiones = await this.buscarConexiones(idsConexion);
    
    if (conexiones?.error) {
      console.log('Error al buscar conexiones:', conexiones.error);
      return conexiones;
    }

    console.log('Conexiones encontradas:', conexiones);
    return { conexiones: conexiones };
  }
  
  async getChecklists(token: string) {
    const nombre = await this.decodeToken(token);
    if (!nombre) {
      return { error: 'Token no válido' };
    }
  
    const permisos = await this.getPermisos(nombre);
    if (permisos?.error) return permisos;
  
    // Obtener las conexiones correspondientes a todos los permisos
    const idsConexion = permisos.map(permiso => permiso.idConexion);
    const conexiones = await this.buscarConexiones(idsConexion);
    if (conexiones?.error) return conexiones;
  
    // Definir el tipo de resultados
    type Resultado = {
      nombreConexion: string;
      checklists: { nombre: string; alta: boolean; id: number }[];
    };

    const resultados: Resultado[] = [];

    for (const conexion of conexiones) {
      const checklists = await this.listasRepository.find({
        where: {
          local: conexion.nombreConexion,
        },
      });

      resultados.push({
        nombreConexion: conexion.nombreConexion,
        checklists: checklists.map(cl => ({
          nombre: cl.nombre,
          alta: Buffer.isBuffer(cl.alta) ? cl.alta[0] === 1 : Boolean(cl.alta),
          id: Number(cl.idlista), // <-- AÑADE EL ID AQUÍ
        })),
      });
    }

    return resultados;
  }
  


  async postChecklist(token:string, nombreLocal: string, nombreLista: string, entradas: Entrada[]) {

    const nombre = await this.decodeToken(token);
    if (!nombre) {
      return { error: 'Token no válido' };
    }

    const permisos = await this.getPermisos(nombre);
    if (permisos?.error) return permisos;

    
    if (!Array.isArray(entradas)) {
      console.error('El parámetro "entradas" no es un array:', entradas);
      return { error: '"entradas" debe ser un array.' };
    }

    const existingChecklist = await this.listasRepository.findOne({
      where: {
        nombre: nombreLista,
        local: nombreLocal,
      },
    });

    if (existingChecklist) {
      return { error: 'Ya existe una checklist con ese nombre' };
    }

    // Crear y guardar la checklist
    const newChecklist = this.listasRepository.create({
      nombre: nombreLista,
      local: nombreLocal,
      alta: 1, 
    });

    await this.listasRepository.save(newChecklist);

    for (const [i, entrada] of entradas.entries()) {
      const newEntrada = this.entradasRepository.create({
        tipo: entrada.tipo,
        idlista: Number(newChecklist.idlista),
        orden: i + 1,
      });
      await this.entradasRepository.save(newEntrada);
    }

    return { message: 'Checklist y entradas creadas exitosamente' };
  }


}

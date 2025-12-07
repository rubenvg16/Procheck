import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';
import { Respuestas } from 'src/entitiesies/checklist_online/entities/Respuestas';
import { Usuarios } from 'src/entitiesies/checklist_online/entities/Usuarios';
import { UserService } from 'src/user/user.service';
import { Repository, Between, In } from 'typeorm';

@Injectable()
export class SearchService {
    usuario: string;

    constructor(
        @InjectRepository(Respuestas, 'checklistsConnection')
        private readonly respuestasRepository: Repository<Respuestas>,
        @InjectRepository(Usuarios, 'checklistsConnection')
        private readonly usuariosRepository: Repository<Usuarios>,
        @InjectRepository(Listas, 'checklistsConnection')
        private readonly listasRepository: Repository<Listas>,
        @InjectRepository(Entradas, 'checklistsConnection')
        private readonly entradasRepository: Repository<Entradas>,

        private readonly userservice: UserService,

    ) { }

    async searchRespuestas(local: string, fechaInicio: string | Date, fechaFin: string | Date, lista?: string) {
        let listasIds: any[] = [];
        if (lista && lista !== 'undefined' && lista !== '') {
            // Buscar el id de la lista por nombre y local
            const listaEntity = await this.listasRepository.findOne({
                where: { nombre: lista, local: local }
            });
            if (listaEntity) {
                listasIds = [listaEntity.idlista];
            } else {
                throw new Error(`No se encontró la lista "${lista}" para el local "${local}"`);
            }
        } else {
            // Buscar todas las listas del local
            listasIds = (await this.listasRepository.find({
                where: { local: local }
            })).map(l => l.idlista);
        }

        if (!listasIds || listasIds.length === 0) {
            throw new Error(`No se encontraron listas para el filtro dado (local: ${local}, lista: ${lista})`);
        }

        // Asegura que la fecha de fin incluya todo el día
        const fechaInicioDate = new Date(fechaInicio);
        const fechaFinDate = new Date(fechaFin);
        fechaFinDate.setHours(23, 59, 59, 999);

        const result = await this.respuestasRepository.find({
            where: {
                fecha: Between(fechaInicioDate, fechaFinDate),
                idLista: In(listasIds),
            },
        });

        const nombreRespuestas = (await this.entradasRepository.find({
            where: {
                idlista: In(listasIds),
                orden: In(result.map(r => r.orden)),
            }
        })).map(r => r.nombre);

        return { respuestas: result, nombres: nombreRespuestas };
    }

    async searchRespuestasDetalle(local: string, fechaInicio: string | Date, fechaFin: string | Date, lista?: string) {
        const respuestasData = await this.searchRespuestas(local, fechaInicio, fechaFin, lista);

        // Obtener todas las entradas de la lista
        const entradas = await this.entradasRepository.find({
            where: { idlista: In(respuestasData.respuestas.map(r => r.idLista)) },
        });

        // Filtrar entradas que tengan al menos una respuesta
        const entradasConRespuestas = entradas.filter((entrada) =>
            respuestasData.respuestas.some(
                (respuesta) => respuesta.idLista === entrada.idlista && respuesta.orden === entrada.orden
            )
        );

        // Inicializar tabla con estructura { [entrada]: { [fecha]: { valor, usuario } } }
        const fechasSet = new Set<string>();
        const tabla: { [entrada: string]: { [fecha: string]: { valor: string, usuario: string } } } = {};

        entradasConRespuestas.forEach((entrada) => {
            tabla[entrada.nombre] = {};
        });

        respuestasData.respuestas.forEach((respuesta) => {
            const fecha = respuesta.fecha.toISOString().slice(0, 19);
            fechasSet.add(fecha);

            const entrada = entradasConRespuestas.find(
                (e) => e.idlista === respuesta.idLista && e.orden === respuesta.orden
            );

            if (entrada) {
                tabla[entrada.nombre][fecha] = { valor: respuesta.valor, usuario: respuesta.usuario };
            }
        });

        // Asegúrate de que todas las fechas tengan un valor para cada entrada
        const fechas = Array.from(fechasSet).sort();
        entradasConRespuestas.forEach((entrada) => {
            fechas.forEach((fecha) => {
                if (!tabla[entrada.nombre][fecha]) {
                    tabla[entrada.nombre][fecha] = { valor: '', usuario: '' };
                }
            });
        });

        return {
            fechas,
            tabla,
        };
    }
}

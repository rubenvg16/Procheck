import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import { EntradasService } from '../entradas/entradas.service';
import { UpdateListaDto } from './updateListaDto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Listas } from 'src/entitiesies/checklist_online/entities/Listas';

@Controller('listas')//manejar rutas que comiencen por /listas
export class ListasController {
  constructor(
    private readonly entradasService: EntradasService,
    @InjectRepository(Listas, 'checklistsConnection')
    private readonly listasRepo: Repository<Listas>
  ) { }

  @Get(':idLista')//definicion endpoint GET /listas/:idLista
  async getListaDetails(@Param('idLista') idLista: string) {
    //obtiene idLista de URL, lo convierte en numero, y llama a getListaDetails para obtener detalles de la lista
    return this.entradasService.getListaDetails(+idLista);
  }

  @Put(':idLista')//definicion endpoint PUT /listas/:idLista
  async updateLista(//recibe idLista de URL y cuerpo de peticion como objeto UpdateListaDto
    @Param('idLista') idLista: string,
    @Body() updateListaDto: UpdateListaDto,
  ) {//llama a updateLista para actualizar lista
    return this.entradasService.updateLista(+idLista, updateListaDto);
  }

  @Put(':idLista/full-update')//definicion endpoint PUT /listas/:idLista/full-update
  async updateListaFull(//recibe idLista y cuerpo con toda la info de la lista mas sus entradas
    @Param('idLista') idLista: number,
    @Body() body: any
  ) {//llama a updateListaFull para actualizar completamente lista y sus entradas
    return this.entradasService.updateListaFull(idLista, body);
  }

  @Post('by-locales')// definicion endpoint POST /listas/by-locales
  async getListasByLocales(@Body('locales') locales: string[]) { // recibe un array de locales en el cuerpo de la peticion
    return this.listasRepo.find({ //busca listas en la base de datos
      where: { // condiciones de busqueda
        local: In(locales), // local debe estar en el array de locales
        alta: 1 // Solo listas activas
      }
    });
  }

  @Post(':idLista/duplicate')
  async duplicateLista(
    @Param('idLista') idLista: string,
    @Body('targetLocal') targetLocal: string
  ) {
    return this.entradasService.duplicateLista(+idLista, targetLocal);
  }

  @Put(':idLista/full-update-multiple')
  async updateListaFullMultiple(@Param('idLista') idLista: string, @Body() body: any) {
    return this.entradasService.updateListaFullMultiple(+idLista, body);
  }

}
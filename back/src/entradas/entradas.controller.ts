// src/entradas/entradas.controller.ts
import { Controller, Get, Param, Body, Put, Delete, Post, UseGuards } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { UpdateEntradaDto } from './updateEntradaDto.dto';
import { UpdateListaDto } from '../listas/updateListaDto.dto';
import { CreateEntradaDto } from './createEntradaDto.dto';
import { Entradas } from 'src/entitiesies/checklist_online/entities/Entradas';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BadRequestException } from '@nestjs/common';

//@UseGuards(AuthGuard)
@Controller('entradas')// maneja rutas que comienzan por /entradas
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) { }

  @Get()//endpoint GET /entradas
  findAll() {
    return this.entradasService.findAll();
  }//devuelve todas las entradas de BD

  @Get('by-lista/:idLista')//endpoint GET /entradas/by-lista/:idLista
  async getEntradasByLista(@Param('idLista') idLista: string) {
    return this.entradasService.findByListaId(+idLista);
  }//devuelve entradas de una lista especifica

  @Put(':id')//endpoint PUT /entradas/:id
  async updateEntrada(@Param('id') id: number, @Body() updateEntradaDto: UpdateEntradaDto) {
    return this.entradasService.updateEntrada(id, updateEntradaDto);
  }//actualiza entrada especifica por su ID usando datos recibidos en el body 

  @Get(':idLista')//endpoint GET /entradas/:idLista
  async getListaDetails(@Param('idLista') idLista: string) {
    return this.entradasService.getListaDetails(+idLista);
  }//obtiene detalles de una lista especifica usando su ID

  @Put(':idLista')//enpoiunt PUT /entradas/:idLista
  async updateLista(@Param('idLista') idLista: string, @Body() updateListaDto: UpdateListaDto) {
    return this.entradasService.updateLista(+idLista, updateListaDto);
  }//actualiza datos de una lista especifica usando su ID y datos recibidos en el body

  @Delete(':idlista/:orden')//endpoint DELETE /entradas/:idLista/:orden
  async deleteEntrada(
    @Param('idlista') idlista: number,
    @Param('orden') orden: number,
  ) {
    return this.entradasService.deleteEntrada(+idlista, +orden);
  }//elimina entrada especifica de una lista usando ID de la lista y el orden de la entrada

  @Post('by-lista/:idLista')//endpoint POST /entradas/by-lista/:idLista
  async addEntrada(
    @Param('idLista') idLista: number,
    @Body() createEntradaDto: CreateEntradaDto,
  ): Promise<Entradas> {
    return this.entradasService.addEntrada(idLista, createEntradaDto);
  }//agrega nueva entrada a una lista especifica

  @Get('locales/:email')//endpoint GET /entradas/locales/:email
  async getLocales(@Param('email') email: string) {
    return this.entradasService.getLocales(email);
  }//obtiene locales asociados a un usuario(email)

  
  //LOCALES
  @Post('enviar')
  async enviarChecklist(@Body() body: any) {
    // body: { idLista, localLista, user, respuestas: [{orden, tipo, valor}] }
    await this.entradasService.guardarRespuestas(body);
    return { success: true };
  }
}

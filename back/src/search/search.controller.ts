import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('respuestas')
  async getRespuestas(
    @Query('local') local: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('lista') lista: string,
  ) {
    return this.searchService.searchRespuestas(local, fechaInicio, fechaFin, lista);
  }

  @Post('respuestas')
  async postRespuestas(
    @Body('local') local: string,
    @Body('fechaInicio') fechaInicio: string,
    @Body('fechaFin') fechaFin: string,
    @Body('lista') lista: string,
  ) {
    return this.searchService.searchRespuestas(local, fechaInicio, fechaFin, lista);
  }

  @Post('respuestas/detalle')
  async postRespuestasDetalle(
    @Body('local') local: string,
    @Body('fechaInicio') fechaInicio: string,
    @Body('fechaFin') fechaFin: string,
    @Body('lista') lista: string,
  ) {
    return this.searchService.searchRespuestasDetalle(local, fechaInicio, fechaFin, lista);
  }
}

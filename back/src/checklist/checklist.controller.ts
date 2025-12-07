import { Body, Controller, Post } from '@nestjs/common';
import { ChecklistService } from './checklist.service';

@Controller('checklists')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) { }


  @Post('checklist')
  postChecklist(@Body() body: { nombresLocales: string[], nombreLista: string, entradas: any[] }) {
    const { nombresLocales, nombreLista, entradas } = body;
    return this.checklistService.postChecklist(nombresLocales, nombreLista, entradas);
  }

}

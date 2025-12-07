import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('conexiones')
  getConexiones(@Headers('authorization') authHeader: string) {
    // authHeader debería tener el formato "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];
    return this.dashboardService.getConexiones(token);
  }

  @Get('checklists')
  getChecklists(@Headers('authorization') authHeader: string) {
    // authHeader debería tener el formato "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];
    return this.dashboardService.getChecklists(token);
  }
}

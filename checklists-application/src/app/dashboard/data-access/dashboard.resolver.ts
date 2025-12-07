import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardResolver implements Resolve<any> {
  constructor(private dashboardService: DashboardService) {}

  resolve(): Observable<any> {
    return this.dashboardService.getChecklists();
  }
}

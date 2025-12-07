import { Component, Input } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule]
})
export class NavbarComponent {
  @Input() title = '';
  @Input() showBack = false;

  constructor(private location: Location, private router: Router) {}

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/service/auth';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.scss',
  standalone: true,
})
export class AdminNavbar {
  auth = inject(AuthService);
}

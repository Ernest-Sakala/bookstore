import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar {
  auth = inject(AuthService);

  search = output<string>();

  menuOpen = false;

  onSearch(event: Event) {
    this.search.emit((event.target as HTMLInputElement).value);
  }
}

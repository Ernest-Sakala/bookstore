import { Component, inject, output, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth';
import { CartService } from '../../core/service/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  standalone: true
})
export class Navbar implements OnInit {
  auth        = inject(AuthService);
  cartService = inject(CartService);

  search = output<string>();

  menuOpen = false;

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.cartService.loadCart();
    }
  }

  onSearch(event: Event) {
    this.search.emit((event.target as HTMLInputElement).value);
  }
}

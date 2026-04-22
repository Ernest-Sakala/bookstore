import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';

import { CartService } from '../../../core/service/cart.service';
import { AuthService } from '../../../core/service/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-checkout',
  imports: [Navbar, RouterLink, DecimalPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {

  cartService = inject(CartService);
  auth        = inject(AuthService);
  router      = inject(Router);

  placing = signal(false);
  placed  = signal(false);
  orderId = signal<string | null>(null);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (!this.cartService.cart()) {
      this.cartService.loadCart();
    }
  }

  placeOrder() {
    this.placing.set(true);
    this.cartService.checkout().subscribe({
      next: (res: any) => {
        this.placing.set(false);
        this.placed.set(true);
        this.orderId.set(res.data?.checkout?.id ?? null);
      },
      error: (err: any) => {
        this.placing.set(false);
        Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message ?? 'Checkout failed.', 'error');
      },
    });
  }
}

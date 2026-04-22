import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';

import { CartService } from '../../../core/service/cart.service';
import { AuthService } from '../../../core/service/auth';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-cart-page',
  imports: [Navbar, RouterLink, DecimalPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage implements OnInit {

  cartService = inject(CartService);
  auth        = inject(AuthService);
  router      = inject(Router);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/cart' } });
      return;
    }
    this.cartService.loadCart();
  }

  increase(itemId: string, current: number) {
    this.cartService.updateItem(itemId, current + 1).subscribe();
  }

  decrease(itemId: string, current: number) {
    if (current <= 1) { this.remove(itemId); return; }
    this.cartService.updateItem(itemId, current - 1).subscribe();
  }

  remove(itemId: string) {
    this.cartService.removeItem(itemId).subscribe();
  }

  clearCart() {
    Swal.fire({
      title: 'Clear cart?',
      text: 'All items will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then(r => { if (r.isConfirmed) this.cartService.clearCart().subscribe(); });
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}

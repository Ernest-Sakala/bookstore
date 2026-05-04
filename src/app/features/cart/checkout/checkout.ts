import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Apollo } from 'apollo-angular';

import { CartService } from '../../../core/service/cart.service';
import { AuthService } from '../../../core/service/auth';
import { Navbar } from '../../../shared/navbar/navbar';
import { PROCESS_PAYMENT_MUTATION } from '../../../core/graphql/operations';
import { PaymentResult } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  imports: [Navbar, RouterLink, DecimalPipe, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {

  cartService = inject(CartService);
  auth        = inject(AuthService);
  router      = inject(Router);
  apollo      = inject(Apollo);
  fb          = inject(FormBuilder);

  checkoutStep = signal<1 | 2 | 3>(1);
  placing      = signal(false);
  placed       = signal(false);
  orderId      = signal<string | null>(null);

  shippingAddress = signal('');

  addressForm = this.fb.group({
    street:  ['', Validators.required],
    city:    ['', Validators.required],
    country: ['', Validators.required],
  });

  paymentForm = this.fb.group({
    method:     ['CARD', Validators.required],
    cardNumber: [''],
    expiryDate: [''],
    cvv:        [''],
  });

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (!this.cartService.cart()) {
      this.cartService.loadCart();
    }

    // Dynamic validators for card fields when method=CARD
    this.paymentForm.get('method')!.valueChanges.subscribe(method => {
      const cardNumber = this.paymentForm.get('cardNumber')!;
      const expiryDate = this.paymentForm.get('expiryDate')!;
      const cvv        = this.paymentForm.get('cvv')!;
      if (method === 'CARD') {
        cardNumber.setValidators([Validators.required]);
        expiryDate.setValidators([Validators.required]);
        cvv.setValidators([Validators.required]);
      } else {
        cardNumber.clearValidators();
        expiryDate.clearValidators();
        cvv.clearValidators();
      }
      cardNumber.updateValueAndValidity();
      expiryDate.updateValueAndValidity();
      cvv.updateValueAndValidity();
    });
    // trigger initial validation
    this.paymentForm.get('method')!.setValue('CARD');
  }

  continueToPayment() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    const { street, city, country } = this.addressForm.getRawValue();
    this.shippingAddress.set(`${street}, ${city}, ${country}`);
    this.checkoutStep.set(2);
  }

  submitPaymentAndOrder() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const { method, cardNumber, expiryDate, cvv } = this.paymentForm.getRawValue();

    this.placing.set(true);

    this.apollo.mutate<{ processPayment: PaymentResult }>({
      mutation: PROCESS_PAYMENT_MUTATION,
      variables: {
        method,
        cardNumber: method === 'CARD' ? cardNumber : null,
        expiryDate: method === 'CARD' ? expiryDate : null,
        cvv:        method === 'CARD' ? cvv : null,
      },
    }).subscribe({
      next: (res) => {
        const payResult = res.data?.processPayment;
        if (!payResult?.success) {
          this.placing.set(false);
          Swal.fire('Payment Failed', payResult?.message ?? 'Payment was not successful.', 'error');
          return;
        }
        // Payment succeeded — now place the order
        this.cartService.checkout(this.shippingAddress()).subscribe({
          next: (orderRes: any) => {
            this.placing.set(false);
            this.placed.set(true);
            this.orderId.set(orderRes.data?.checkout?.id ?? null);
            this.checkoutStep.set(3);
          },
          error: (err: any) => {
            this.placing.set(false);
            Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message ?? 'Checkout failed.', 'error');
          },
        });
      },
      error: (err: any) => {
        this.placing.set(false);
        Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message ?? 'Payment failed.', 'error');
      },
    });
  }

  get isCard() {
    return this.paymentForm.get('method')?.value === 'CARD';
  }
}

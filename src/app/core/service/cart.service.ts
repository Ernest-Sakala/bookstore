import { computed, inject, Injectable, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map, tap } from 'rxjs';
import { Cart, CartItem } from '../models/models';
import {
  ADD_TO_CART_MUTATION,
  CART_QUERY,
  CLEAR_CART_MUTATION,
  REMOVE_CART_ITEM_MUTATION,
  UPDATE_CART_ITEM_MUTATION,
  CHECKOUT_MUTATION,
} from '../graphql/operations';
import { AuthService } from './auth';

export interface AddToCartInput {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  coverImageUrl?: string;
  quantity?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private apollo = inject(Apollo);
  private auth   = inject(AuthService);

  private _cart = signal<Cart | null>(null);

  readonly cart       = this._cart.asReadonly();
  readonly itemCount  = computed(() => this._cart()?.totalItems ?? 0);
  readonly totalPrice = computed(() => this._cart()?.totalPrice ?? 0);

  loadCart() {
    if (!this.auth.isLoggedIn()) return;
    this.apollo.query<{ cart: Cart }>({
      query: CART_QUERY,
      fetchPolicy: 'network-only',
    }).pipe(map(r => r.data.cart))
      .subscribe(cart => this._cart.set(cart));
  }

  addToCart(input: AddToCartInput) {
    return this.apollo.mutate<{ addToCart: Cart }>({
      mutation: ADD_TO_CART_MUTATION,
      variables: { input },
    }).pipe(
      map(r => r.data!.addToCart),
      tap(cart => this._cart.set(cart)),
    );
  }

  updateItem(itemId: string, quantity: number) {
    return this.apollo.mutate<{ updateCartItem: Cart }>({
      mutation: UPDATE_CART_ITEM_MUTATION,
      variables: { itemId, quantity },
    }).pipe(
      map(r => r.data!.updateCartItem),
      tap(cart => this._cart.set(cart)),
    );
  }

  removeItem(itemId: string) {
    return this.apollo.mutate<{ removeCartItem: Cart }>({
      mutation: REMOVE_CART_ITEM_MUTATION,
      variables: { itemId },
    }).pipe(
      map(r => r.data!.removeCartItem),
      tap(cart => this._cart.set(cart)),
    );
  }

  clearCart() {
    return this.apollo.mutate<{ clearCart: boolean }>({
      mutation: CLEAR_CART_MUTATION,
    }).pipe(tap(() => this._cart.set(null)));
  }

  checkout() {
    return this.apollo.mutate<{ checkout: { id: string; totalAmount: number; status: string; createdAt: string } }>({
      mutation: CHECKOUT_MUTATION,
    }).pipe(tap(() => this._cart.set(null)));
  }
}

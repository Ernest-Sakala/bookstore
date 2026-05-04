import { Routes } from '@angular/router';
import { BookGrid } from './features/books/pages/book-grid/book-grid';
import { BookUpload } from './features/books/pages/book-upload/book-upload';
import { BooksList } from './features/books/pages/books-list/books-list';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: BookGrid,
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./core/auth/register/register').then(m => m.Register),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/login/login').then(m => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./core/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./core/auth/reset-password/reset-password').then(m => m.ResetPassword),
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./features/books/pages/book-detail/book-detail').then(m => m.BookDetail),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart-page/cart-page').then(m => m.CartPage),
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/cart/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'my-orders',
    loadComponent: () =>
      import('./features/customer/my-orders/my-orders').then(m => m.MyOrders),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/customer/profile/profile').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'upload-book',
    component: BookUpload,
  },
  {
    path: 'books-list',
    component: BooksList,
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboard),
  },
];

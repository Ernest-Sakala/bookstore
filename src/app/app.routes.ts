import { Routes } from '@angular/router';
import {BookGrid} from './features/books/pages/book-grid/book-grid';
import {BookUpload} from './features/books/pages/book-upload/book-upload';
import {BooksList} from './features/books/pages/books-list/books-list';

export const routes: Routes = [
  {
    path: '',
    component: BookGrid,
  },
  {
    path: 'upload-book',
    component: BookUpload,
  },
  {
    path: 'books-list',
    component: BooksList,
  },
];

import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Apollo } from 'apollo-angular';
import { Book, BookPage, BookService } from '../../services/book-service';
import { AuthService } from '../../../../core/service/auth';
import { CartService } from '../../../../core/service/cart.service';
import { Navbar } from '../../../../shared/navbar/navbar';
import { Pagination } from '../../../../shared/pagination/pagination';
import { CATEGORIES_QUERY } from '../../../../core/graphql/operations';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-book-grid',
  imports: [Navbar, RouterLink, Pagination, FormsModule, DecimalPipe],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
  standalone: true,
})
export class BookGrid implements OnInit {

  auth        = inject(AuthService);
  router      = inject(Router);
  cartService = inject(CartService);
  apollo      = inject(Apollo);

  books      = signal<Book[]>([]);
  loading    = signal(true);
  addingId   = signal<number | null>(null);
  searchTerm = signal('');

  categories       = signal<string[]>([]);
  selectedCategory = signal('');

  currentPage    = signal(0);
  totalPages     = signal(0);
  totalElements  = signal(0);
  readonly pageSize = PAGE_SIZE;

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadPage(0);
  }

  private loadCategories() {
    this.apollo.query<{ categories: string[] }>({
      query: CATEGORIES_QUERY,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => this.categories.set(res.data?.categories ?? []),
      error: () => {},
    });
  }

  private loadPage(page: number) {
    this.loading.set(true);
    const term = this.searchTerm();
    const cat  = this.selectedCategory() || undefined;
    const obs = term
      ? this.bookService.searchBooks(term, page, PAGE_SIZE, cat)
      : this.bookService.getBooks(page, PAGE_SIZE, cat);

    obs.subscribe({
      next: (p: BookPage) => {
        this.books.set(p.books);
        this.currentPage.set(p.currentPage);
        this.totalPages.set(p.totalPages);
        this.totalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(page: number) {
    this.loadPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(keyword: string) {
    this.searchTerm.set(keyword);
    this.loadPage(0);
  }

  onCategoryChange(cat: string) {
    this.selectedCategory.set(cat);
    this.loadPage(0);
  }

  addToCart(book: Book) {
    if (!this.auth.isLoggedIn()) {
      Swal.fire({
        title: 'Sign in required',
        text: 'Please sign in to add books to your cart.',
        icon: 'info',
        confirmButtonText: 'Sign In',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#6366f1',
      }).then(r => { if (r.isConfirmed) this.router.navigate(['/login']); });
      return;
    }

    this.addingId.set(book.id);
    this.cartService.addToCart({
      bookId:        String(book.id),
      bookTitle:     book.title,
      bookAuthor:    book.author,
      bookPrice:     book.price ?? 0,
      coverImageUrl: book.imageSlug,
      quantity:      1,
    }).subscribe({
      next: () => {
        this.addingId.set(null);
        Swal.fire({ title: 'Added to cart!', icon: 'success', timer: 1200, showConfirmButton: false });
      },
      error: (err) => {
        this.addingId.set(null);
        Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error');
      },
    });
  }
}

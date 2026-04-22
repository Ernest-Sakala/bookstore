import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Book, BookService } from '../../services/book-service';
import { AuthService } from '../../../../core/service/auth';
import { CartService } from '../../../../core/service/cart.service';
import { Navbar } from '../../../../shared/navbar/navbar';

@Component({
  selector: 'app-book-grid',
  imports: [Navbar, RouterLink],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
  standalone: true
})
export class BookGrid implements OnInit {

  auth        = inject(AuthService);
  router      = inject(Router);
  cartService = inject(CartService);
  books       = signal<Book[]>([]);
  loading     = signal(true);
  addingId    = signal<number | null>(null);

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books.set(data);
      this.loading.set(false);
    });
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

  onSearch(keyword: string) {
    if (!keyword.trim()) {
      this.bookService.getBooks().subscribe(data => this.books.set(data));
      return;
    }
    this.bookService.searchBooks(keyword).subscribe({
      next: (res) => { if (res.data) this.books.set(res.data.books); }
    });
  }
}

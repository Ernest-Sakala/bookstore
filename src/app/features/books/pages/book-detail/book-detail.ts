import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';

import { Book, BookService } from '../../services/book-service';
import { CartService } from '../../../../core/service/cart.service';
import { AuthService } from '../../../../core/service/auth';
import { Navbar } from '../../../../shared/navbar/navbar';

@Component({
  selector: 'app-book-detail',
  imports: [Navbar, RouterLink, DecimalPipe],
  templateUrl: './book-detail.html',
  styleUrl: './book-detail.scss',
})
export class BookDetail implements OnInit {

  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private auth        = inject(AuthService);

  book    = signal<Book | null>(null);
  loading = signal(true);
  adding  = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.bookService.getBookById(id).subscribe({
      next: (b) => { this.book.set(b); this.loading.set(false); },
      error: ()  => { this.loading.set(false); },
    });
  }

  addToCart() {
    if (!this.auth.isLoggedIn()) {
      Swal.fire({
        title: 'Sign in required',
        text: 'Please sign in to add books to your cart.',
        icon: 'info',
        confirmButtonText: 'Sign In',
        cancelButtonText: 'Cancel',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
      }).then(r => { if (r.isConfirmed) this.router.navigate(['/login']); });
      return;
    }

    const b = this.book();
    if (!b) return;

    this.adding.set(true);
    this.cartService.addToCart({
      bookId:       String(b.id),
      bookTitle:    b.title,
      bookAuthor:   b.author,
      bookPrice:    b.price ?? 0,
      coverImageUrl: b.imageSlug,
      quantity:     1,
    }).subscribe({
      next: () => {
        this.adding.set(false);
        Swal.fire({ title: 'Added to cart!', icon: 'success', timer: 1200, showConfirmButton: false });
      },
      error: (err) => {
        this.adding.set(false);
        Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error');
      },
    });
  }


  stripHtml(html: string | undefined): string {
    const div = document.createElement('div');
    if (html != null) {
      div.innerHTML = html;
    }
    return div.textContent || div.innerText || '';
  }
}

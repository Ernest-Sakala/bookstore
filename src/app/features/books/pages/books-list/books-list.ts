import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Book, BookPage, BookService } from '../../services/book-service';
import { Pagination } from '../../../../shared/pagination/pagination';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-books-list',
  imports: [RouterLink, Pagination],
  templateUrl: './books-list.html',
  styleUrl: './books-list.scss',
})
export class BooksList implements OnInit {

  books        = signal<Book[]>([]);
  loading      = signal(true);

  currentPage    = signal(0);
  totalPages     = signal(0);
  totalElements  = signal(0);
  readonly pageSize = PAGE_SIZE;

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit() {
    this.loadBooks(0);
  }

  loadBooks(page = 0) {
    this.loading.set(true);
    this.bookService.getBooks(page, PAGE_SIZE).subscribe({
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
    this.loadBooks(page);
  }

editBook(book: Book) {
    this.router.navigate(['/edit-book', book.id]);
  }

  deleteBook(book: Book) {
    Swal.fire({
      title: `Delete "${book.title}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.bookService.deleteBook(book.id).subscribe({
        next: (success) => {
          if (success) {
            Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
            this.loadBooks(this.currentPage());
          }
        },
        error: (err) => Swal.fire('Error', err.message, 'error'),
      });
    });
  }
}

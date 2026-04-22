import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Book, BookService } from '../../services/book-service';
import { AuthService } from '../../../../core/service/auth';
import { Navbar } from '../../../../shared/navbar/navbar';

@Component({
  selector: 'app-book-grid',
  imports: [Navbar],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
  standalone: true
})
export class BookGrid implements OnInit {

  auth    = inject(AuthService);
  router  = inject(Router);
  books   = signal<Book[]>([]);
  loading = signal(true);

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      this.books.set(data);
      this.loading.set(false);
    });
  }

  downloadBook(book: any) {
    const link = document.createElement('a');
    link.href = 'http://localhost:8080/uploads/files/' + book.filePath.split('/').pop();
    link.download = book.title + '.pdf';
    link.click();
  }

  onSearch(keyword: string) {
    if (!keyword.trim()) {
      this.bookService.getBooks().subscribe(data => this.books.set(data));
      return;
    }
    this.bookService.searchBooks(keyword).subscribe({
      next: (res) => {
        if (res.data) this.books.set(res.data.books);
      }
    });
  }
}

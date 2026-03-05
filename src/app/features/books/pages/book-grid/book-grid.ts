import {Component, OnInit, signal} from '@angular/core';
import {Book, BookService} from '../../services/book-service';
import {CommonModule, NgForOf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-book-grid',
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,

  ],
  templateUrl: './book-grid.html',
  styleUrl: './book-grid.scss',
})
export class BookGrid implements OnInit {

  books = signal<Book[]>([]);
  loading = signal(true);  // signal instead of plain array

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      console.log('Books fetched from GraphQL:', data);
      this.books.set(data); // update signal
      this.loading.set(false);
    });
  }

  downloadBook(book: any) {
    const link = document.createElement('a');
    link.href = 'http://localhost:8080/uploads/files/' + book.filePath.split('/').pop();
    link.download = book.title + '.pdf';
    link.click();
  }

}

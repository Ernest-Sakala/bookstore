import {Component, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {Book, BookService} from '../../services/book-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-books-list',
  imports: [
    RouterLink
  ],
  templateUrl: './books-list.html',
  styleUrl: './books-list.scss',
})
export class BooksList implements OnInit {

  books = signal<Book[]>([]);
  loading = signal(true);

  constructor(private bookService: BookService, private router: Router) {}


  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.books.set([...data]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }


  downloadBook(book: Book) {
    const link = document.createElement('a');
    link.href = `http://localhost:8080/uploads/books/${book.filePath}`;
    link.download = book.filePath;
    link.click();
  }

  editBook(book: Book) {
    // Navigate to edit page, e.g., /edit-book/:id
    this.router.navigate(['/edit-book', book.id]);
  }

  deleteBook(book: Book) {
    Swal.fire({
      title: `Delete "${book.title}"?`,
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(book.id).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire(
                'Deleted!',
                `"${book.title}" has been deleted.`,
                'success'
              );
              // Replace the books array to trigger Angular reactivity
              const updatedBooks = this.books().filter(b => b.id !== book.id);
              this.books.set([...updatedBooks]);
            } else {
              Swal.fire(
                'Error',
                `Failed to delete "${book.title}".`,
                'error'
              );
            }
          },
          error: (err) => {
            Swal.fire('Error', `Something went wrong: ${err.message}`, 'error');
          }
        });
      }
    });
  }
}

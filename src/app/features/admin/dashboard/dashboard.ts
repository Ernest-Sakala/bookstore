import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/service/auth';
import { Book, BookService } from '../../books/services/book-service';
import { AdminNavbar } from '../navbar/admin-navbar';
import { Sidebar, AdminSection } from '../../../shared/sidebar/sidebar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminNavbar, Sidebar, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true
})
export class AdminDashboard implements OnInit {

  auth         = inject(AuthService);
  router       = inject(Router);
  bookService  = inject(BookService);
  fb           = inject(FormBuilder);

  /* ── UI state ── */
  activeSection = signal<AdminSection>('overview');
  sidebarCollapsed = signal(false);

  /* ── Books ── */
  books   = signal<Book[]>([]);
  loading = signal(false);

  /* ── Upload form ── */
  uploadForm = this.fb.group({
    title:    ['', Validators.required],
    author:   ['', Validators.required],
    category: ['', Validators.required],
    image:    [null as File | null, Validators.required],
    file:     [null as File | null, Validators.required],
  });
  uploading     = signal(false);
  uploadSuccess = signal('');
  uploadError   = signal('');

  /* ── Image preview ── */
  imagePreview = signal<string | null>(null);

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading.set(true);
    this.bookService.getBooks().subscribe({
      next: (data) => { this.books.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  setSection(section: AdminSection) {
    this.activeSection.set(section);
    if (section === 'books') this.loadBooks();
  }

  /* ── Stats for overview ── */
  get totalBooks()      { return this.books().length; }
  get totalCategories() { return new Set(this.books().map(b => b.category)).size; }

  /* ── File inputs ── */
  onFileChange(event: Event, field: 'image' | 'file') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadForm.patchValue({ [field]: file });

    if (field === 'image') {
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  submitUpload() {
    if (this.uploadForm.invalid) { this.uploadForm.markAllAsTouched(); return; }

    this.uploading.set(true);
    this.uploadSuccess.set('');
    this.uploadError.set('');

    const { title, author, category, image, file } = this.uploadForm.getRawValue();

    this.bookService.uploadBook(title!, author!, category!, image, file).subscribe({
      next: () => {
        this.uploading.set(false);
        this.uploadSuccess.set(`"${title}" uploaded successfully.`);
        this.uploadForm.reset();
        this.imagePreview.set(null);
        this.loadBooks();
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err.message ?? 'Upload failed. Please try again.');
      },
    });
  }

  deleteBook(book: Book) {
    Swal.fire({
      title: `Delete "${book.title}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.bookService.deleteBook(book.id).subscribe({
        next: (ok) => {
          if (ok) {
            this.books.set(this.books().filter(b => b.id !== book.id));
            Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
          }
        },
        error: (err) => Swal.fire('Error', err.message, 'error'),
      });
    });
  }

  downloadBook(book: Book) {
    const link = document.createElement('a');
    link.href = 'http://localhost:8080/uploads/files/' + book.filePath.split('/').pop();
    link.download = book.title + '.pdf';
    link.click();
  }
}

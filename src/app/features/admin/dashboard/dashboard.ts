import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { Apollo } from 'apollo-angular';
import Swal from 'sweetalert2';

import { AuthService } from '../../../core/service/auth';
import { Book, BookService } from '../../books/services/book-service';
import { AdminNavbar } from '../navbar/admin-navbar';
import { Sidebar, AdminSection } from '../../../shared/sidebar/sidebar';
import {
  ADMIN_ORDERS_QUERY,
  UPDATE_ORDER_STATUS_MUTATION,
} from '../../../core/graphql/operations';

export interface OrderItem {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  itemCount: number;
  items: OrderItem[];
}

export const ORDER_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminNavbar, Sidebar, ReactiveFormsModule, DecimalPipe, DatePipe, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  standalone: true,
})
export class AdminDashboard implements OnInit {

  auth         = inject(AuthService);
  router       = inject(Router);
  bookService  = inject(BookService);
  apollo       = inject(Apollo);
  fb           = inject(FormBuilder);

  /* ── UI state ── */
  activeSection    = signal<AdminSection>('overview');
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
  imagePreview  = signal<string | null>(null);

  /* ── Orders ── */
  orders          = signal<Order[]>([]);
  ordersLoading   = signal(false);
  statusFilter    = signal<string>('ALL');
  expandedOrderId = signal<string | null>(null);
  updatingId      = signal<string | null>(null);

  readonly statuses = ORDER_STATUSES;

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
    if (section === 'books')  this.loadBooks();
    if (section === 'orders') this.loadOrders();
  }

  /* ── Overview stats ── */
  get totalBooks()      { return this.books().length; }
  get totalCategories() { return new Set(this.books().map(b => b.category)).size; }
  get totalOrders()     { return this.orders().length; }
  get pendingOrders()   { return this.orders().filter(o => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length; }

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

  /* ── Orders ── */
  loadOrders(status?: string) {
    this.ordersLoading.set(true);
    const vars = status && status !== 'ALL' ? { status } : {};
    this.apollo.query<{ orders: Order[] }>({
      query: ADMIN_ORDERS_QUERY,
      variables: vars,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => { this.orders.set(res.data?.orders ?? []); this.ordersLoading.set(false); },
      error: ()    => this.ordersLoading.set(false),
    });
  }

  setStatusFilter(status: string) {
    this.statusFilter.set(status);
    this.loadOrders(status === 'ALL' ? undefined : status);
  }

  toggleExpand(id: string) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }

  updateStatus(order: Order, newStatus: string) {
    if (order.status === newStatus) return;
    this.updatingId.set(order.id);
    this.apollo.mutate<{ updateOrderStatus: { id: string; status: string } }>({
      mutation: UPDATE_ORDER_STATUS_MUTATION,
      variables: { id: order.id, status: newStatus },
    }).subscribe({
      next: (res) => {
        this.updatingId.set(null);
        const updated = res.data?.updateOrderStatus;
        if (updated) {
          this.orders.update(list =>
            list.map(o => o.id === updated.id ? { ...o, status: updated.status } : o)
          );
        }
      },
      error: (err) => {
        this.updatingId.set(null);
        Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error');
      },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED:  'status-confirmed',
      PROCESSING: 'status-processing',
      SHIPPED:    'status-shipped',
      DELIVERED:  'status-delivered',
      CANCELLED:  'status-cancelled',
    };
    return map[status] ?? 'status-confirmed';
  }

  ordersCountByStatus(status: string) {
    return this.orders().filter(o => o.status === status).length;
  }
}

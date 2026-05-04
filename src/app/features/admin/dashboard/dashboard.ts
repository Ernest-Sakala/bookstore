import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe, DatePipe, NgClass } from '@angular/common';
import { Apollo } from 'apollo-angular';
import Swal from 'sweetalert2';

import { AuthService } from '../../../core/service/auth';
import { Book, BookPage, BookService } from '../../books/services/book-service';
import { Pagination } from '../../../shared/pagination/pagination';
import { AdminNavbar } from '../navbar/admin-navbar';
import { Sidebar, AdminSection } from '../../../shared/sidebar/sidebar';
import { UserInfo } from '../../../core/models/models';
import {
  ADMIN_ORDERS_QUERY,
  UPDATE_ORDER_STATUS_MUTATION,
  ADMIN_USERS_QUERY,
  BLOCK_USER_MUTATION,
  UNBLOCK_USER_MUTATION,
  DELETE_USER_MUTATION,
  CATEGORIES_QUERY,
  ADD_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  AUTHORS_QUERY,
  ADD_AUTHOR_MUTATION,
  DELETE_AUTHOR_MUTATION,
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
  imports: [AdminNavbar, Sidebar, ReactiveFormsModule, FormsModule, DecimalPipe, DatePipe, NgClass, Pagination],
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
  books         = signal<Book[]>([]);
  loading       = signal(false);
  booksPage     = signal(0);
  booksTotalPages    = signal(0);
  booksTotalElements = signal(0);
  readonly booksPageSize = 10;

  /* ── Upload form ── */
  uploadForm = this.fb.group({
    title:    ['', Validators.required],
    author:   ['', Validators.required],
    category: ['', Validators.required],
    price:    [null as number | null, [Validators.required, Validators.min(0)]],
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

  /* ── Users (FR16) ── */
  users        = signal<UserInfo[]>([]);
  usersLoading = signal(false);

  /* ── Categories (FR18) ── */
  categoriesList    = signal<string[]>([]);
  categoriesLoading = signal(false);
  newCategory       = signal('');

  /* ── Authors (FR19) ── */
  authorsList    = signal<string[]>([]);
  authorsLoading = signal(false);
  newAuthor      = signal('');

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks(page = 0) {
    this.loading.set(true);
    this.bookService.getBooks(page, this.booksPageSize).subscribe({
      next: (p: BookPage) => {
        this.books.set(p.books);
        this.booksPage.set(p.currentPage);
        this.booksTotalPages.set(p.totalPages);
        this.booksTotalElements.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onBooksPageChange(page: number) {
    this.loadBooks(page);
  }

  setSection(section: AdminSection) {
    this.activeSection.set(section);
    if (section === 'books')      this.loadBooks(0);
    if (section === 'orders')     this.loadOrders();
    if (section === 'users')      this.loadUsers();
    if (section === 'categories') this.loadCategories();
    if (section === 'authors')    this.loadAuthors();
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
    const { title, author, category, price, image, file } = this.uploadForm.getRawValue();
    this.bookService.uploadBook(title!, author!, category!, image, file, price ?? undefined).subscribe({
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

  /* ── Users (FR16) ── */
  loadUsers() {
    this.usersLoading.set(true);
    this.apollo.query<{ adminUsers: UserInfo[] }>({
      query: ADMIN_USERS_QUERY,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => { this.users.set(res.data?.adminUsers ?? []); this.usersLoading.set(false); },
      error: ()    => this.usersLoading.set(false),
    });
  }

  blockUser(user: UserInfo) {
    this.apollo.mutate<{ blockUser: { id: string; active: boolean } }>({
      mutation: BLOCK_USER_MUTATION,
      variables: { id: user.id },
    }).subscribe({
      next: (res) => {
        const updated = res.data?.blockUser;
        if (updated) {
          this.users.update(list => list.map(u => u.id === updated.id ? { ...u, active: updated.active } : u));
        }
      },
      error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
    });
  }

  unblockUser(user: UserInfo) {
    this.apollo.mutate<{ unblockUser: { id: string; active: boolean } }>({
      mutation: UNBLOCK_USER_MUTATION,
      variables: { id: user.id },
    }).subscribe({
      next: (res) => {
        const updated = res.data?.unblockUser;
        if (updated) {
          this.users.update(list => list.map(u => u.id === updated.id ? { ...u, active: updated.active } : u));
        }
      },
      error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
    });
  }

  deleteUser(user: UserInfo) {
    Swal.fire({
      title: `Delete user "${user.name}"?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.apollo.mutate<{ deleteUser: boolean }>({
        mutation: DELETE_USER_MUTATION,
        variables: { id: user.id },
      }).subscribe({
        next: () => {
          this.users.update(list => list.filter(u => u.id !== user.id));
          Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
        },
        error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
      });
    });
  }

  /* ── Categories (FR18) ── */
  loadCategories() {
    this.categoriesLoading.set(true);
    this.apollo.query<{ categories: string[] }>({
      query: CATEGORIES_QUERY,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => { this.categoriesList.set(res.data?.categories ?? []); this.categoriesLoading.set(false); },
      error: ()    => this.categoriesLoading.set(false),
    });
  }

  submitAddCategory() {
    const name = this.newCategory().trim();
    if (!name) return;
    this.apollo.mutate<{ addCategory: string }>({
      mutation: ADD_CATEGORY_MUTATION,
      variables: { name },
    }).subscribe({
      next: () => {
        this.categoriesList.update(list => [...list, name]);
        this.newCategory.set('');
      },
      error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
    });
  }

  deleteCategory(name: string) {
    Swal.fire({
      title: `Delete category "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.apollo.mutate<{ deleteCategory: boolean }>({
        mutation: DELETE_CATEGORY_MUTATION,
        variables: { name },
      }).subscribe({
        next: () => {
          this.categoriesList.update(list => list.filter(c => c !== name));
          Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
        },
        error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
      });
    });
  }

  /* ── Authors (FR19) ── */
  loadAuthors() {
    this.authorsLoading.set(true);
    this.apollo.query<{ authors: string[] }>({
      query: AUTHORS_QUERY,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => { this.authorsList.set(res.data?.authors ?? []); this.authorsLoading.set(false); },
      error: ()    => this.authorsLoading.set(false),
    });
  }

  submitAddAuthor() {
    const name = this.newAuthor().trim();
    if (!name) return;
    this.apollo.mutate<{ addAuthor: string }>({
      mutation: ADD_AUTHOR_MUTATION,
      variables: { name },
    }).subscribe({
      next: () => {
        this.authorsList.update(list => [...list, name]);
        this.newAuthor.set('');
      },
      error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
    });
  }

  deleteAuthor(name: string) {
    Swal.fire({
      title: `Delete author "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.apollo.mutate<{ deleteAuthor: boolean }>({
        mutation: DELETE_AUTHOR_MUTATION,
        variables: { name },
      }).subscribe({
        next: () => {
          this.authorsList.update(list => list.filter(a => a !== name));
          Swal.fire({ title: 'Deleted', icon: 'success', timer: 1500, showConfirmButton: false });
        },
        error: (err) => Swal.fire('Error', err.graphQLErrors?.[0]?.message ?? err.message, 'error'),
      });
    });
  }
}

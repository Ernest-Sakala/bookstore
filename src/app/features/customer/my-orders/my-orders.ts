import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Apollo } from 'apollo-angular';

import { Navbar } from '../../../shared/navbar/navbar';
import { MY_ORDERS_QUERY } from '../../../core/graphql/operations';
import { MyOrder } from '../../../core/models/models';

@Component({
  selector: 'app-my-orders',
  imports: [Navbar, RouterLink, DatePipe, DecimalPipe, NgClass],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
  standalone: true,
})
export class MyOrders implements OnInit {

  private apollo = inject(Apollo);

  orders          = signal<MyOrder[]>([]);
  loading         = signal(true);
  expandedOrderId = signal<string | null>(null);

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    this.loading.set(true);
    this.apollo.query<{ myOrders: MyOrder[] }>({
      query: MY_ORDERS_QUERY,
      fetchPolicy: 'network-only',
    }).subscribe({
      next: (res) => {
        this.orders.set(res.data?.myOrders ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleExpand(id: string) {
    this.expandedOrderId.set(this.expandedOrderId() === id ? null : id);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      CONFIRMED:  'status-confirmed',
      PROCESSING: 'status-processing',
      SHIPPED:    'status-shipped',
      DELIVERED:  'status-delivered',
      CANCELLED:  'status-cancelled',
    };
    return map[status] ?? 'status-confirmed';
  }
}

import { Component, input, output } from '@angular/core';

export type AdminSection = 'overview' | 'upload' | 'books' | 'orders';

export interface SidebarItem {
  id: AdminSection;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  standalone: true,
})
export class Sidebar {
  active    = input.required<AdminSection>();
  collapsed = input<boolean>(false);

  sectionChange   = output<AdminSection>();
  collapseToggle  = output<void>();

  readonly items: SidebarItem[] = [
    { id: 'overview', label: 'Overview'      },
    { id: 'upload',   label: 'Upload Book'   },
    { id: 'books',    label: 'Manage Books'  },
    { id: 'orders',   label: 'Orders'        },
  ];

  select(id: AdminSection) {
    this.sectionChange.emit(id);
  }
}

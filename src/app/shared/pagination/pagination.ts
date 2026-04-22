import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  standalone: true,
})
export class Pagination {
  currentPage   = input.required<number>();
  totalPages    = input.required<number>();
  totalElements = input.required<number>();
  pageSize      = input.required<number>();

  pageChange = output<number>();

  /** Visible page buttons with null representing an ellipsis gap. */
  readonly pages = computed<(number | null)[]>(() => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);

    const pages: (number | null)[] = [0];

    if (current > 3)          pages.push(null);
    const start = Math.max(1, current - 1);
    const end   = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 4)  pages.push(null);
    pages.push(total - 1);
    return pages;
  });

  readonly from = computed(() => this.currentPage() * this.pageSize() + 1);
  readonly to   = computed(() => Math.min(this.from() + this.pageSize() - 1, this.totalElements()));

  go(page: number | null) {
    if (page === null) return;
    if (page < 0 || page >= this.totalPages()) return;
    this.pageChange.emit(page);
  }
}

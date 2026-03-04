import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookGrid } from './book-grid';

describe('BookGrid', () => {
  let component: BookGrid;
  let fixture: ComponentFixture<BookGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

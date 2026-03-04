import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookUpload } from './book-upload';

describe('BookUpload', () => {
  let component: BookUpload;
  let fixture: ComponentFixture<BookUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

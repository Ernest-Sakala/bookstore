import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Apollo } from 'apollo-angular';

import { BookService } from '../../services/book-service';
import { CATEGORIES_QUERY, AUTHORS_QUERY } from '../../../../core/graphql/operations';

@Component({
  selector: 'app-book-upload',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './book-upload.html',
  styleUrls: ['./book-upload.scss'],
})
export class BookUpload implements OnInit {

  bookForm;
  successMessage = '';

  categories = signal<string[]>([]);
  authors    = signal<string[]>([]);

  constructor(
    private fb:          FormBuilder,
    private bookService: BookService,
    private apollo:      Apollo,
  ) {
    this.bookForm = this.fb.group({
      title:    ['', Validators.required],
      author:   ['', Validators.required],
      category: ['', Validators.required],
      image:    [null as File | null, Validators.required],
    });
  }

  ngOnInit() {
    this.apollo.query<{ categories: string[] }>({
      query: CATEGORIES_QUERY, fetchPolicy: 'network-only',
    }).subscribe({ next: r => this.categories.set(r.data?.categories ?? []) });

    this.apollo.query<{ authors: string[] }>({
      query: AUTHORS_QUERY, fetchPolicy: 'network-only',
    }).subscribe({ next: r => this.authors.set(r.data?.authors ?? []) });
  }

  onFileChange(event: Event, field: 'image' | 'file') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.bookForm.patchValue({ [field]: input.files[0] });
  }

  submitForm() {
    if (this.bookForm.invalid) { this.bookForm.markAllAsTouched(); return; }
    const { title, author, category, image } = this.bookForm.getRawValue();
    this.bookService.uploadBook(title!, author!, category!, image).subscribe({
      next: () => {
        this.successMessage = 'Book uploaded successfully';
        this.bookForm.reset();
      },
      error: (err: any) => console.error('Upload failed', err),
    });
  }
}

import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../services/book-service';
import {RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-book-upload',
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './book-upload.html',
  styleUrls: ['./book-upload.scss'], // fixed typo: styleUrls instead of styleUrl
})
export class BookUpload {

  bookForm;

  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private bookService: BookService
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      image: [null as File | null, Validators.required],
      file: [null as File | null, Validators.required],
    });
  }

  // Unified file input handler
  onFileChange(event: Event, field: 'image' | 'file') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.bookForm.patchValue({ [field]: file });
  }

  // Your submitForm() exactly as before
  submitForm() {

    const { title, author, category, image, file } = this.bookForm.getRawValue();


    this.bookService.uploadBook(title!, author!, category!, image, file)
      .subscribe({
        next: (res: any) => {

          this.successMessage = 'Book uploaded successfully';
          this.bookForm.reset();
        },
        error: (err: any) => console.error('Upload failed', err),
      });
  }
}

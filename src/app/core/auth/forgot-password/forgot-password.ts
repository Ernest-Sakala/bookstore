import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { REQUEST_PASSWORD_RESET_MUTATION } from '../../graphql/operations';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  standalone: true,
})
export class ForgotPassword {

  private apollo = inject(Apollo);
  private fb     = inject(FormBuilder);

  loading = signal(false);
  sent    = signal(false);
  error   = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { email } = this.form.getRawValue();
    this.apollo.mutate<{ requestPasswordReset: boolean }>({
      mutation: REQUEST_PASSWORD_RESET_MUTATION,
      variables: { email },
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        // Always show the same message to avoid revealing whether email exists
        this.loading.set(false);
        this.sent.set(true);
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { RESET_PASSWORD_MUTATION } from '../../graphql/operations';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  standalone: true,
})
export class ResetPassword implements OnInit {

  private apollo = inject(Apollo);
  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  success = signal(false);
  error   = signal('');
  token   = signal('');

  form = this.fb.group({
    newPassword:        ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', Validators.required],
  });

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(token);
    if (!token) {
      this.error.set('Invalid or missing reset token. Please request a new reset link.');
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { newPassword, confirmNewPassword } = this.form.getRawValue();
    if (newPassword !== confirmNewPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.apollo.mutate<{ resetPassword: boolean }>({
      mutation: RESET_PASSWORD_MUTATION,
      variables: { token: this.token(), newPassword },
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.data?.resetPassword) {
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.error.set('Password reset failed. The link may have expired.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.graphQLErrors?.[0]?.message ?? 'Password reset failed. Please try again.');
      },
    });
  }
}

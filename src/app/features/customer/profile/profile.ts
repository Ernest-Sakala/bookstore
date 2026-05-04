import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { Navbar } from '../../../shared/navbar/navbar';
import { AuthService } from '../../../core/service/auth';
import {
  UPDATE_PROFILE_MUTATION,
  CHANGE_PASSWORD_MUTATION,
} from '../../../core/graphql/operations';
import { AuthPayload } from '../../../core/models/models';

const STORAGE_KEY = 'bookstore_user';

@Component({
  selector: 'app-profile',
  imports: [Navbar, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  standalone: true,
})
export class ProfilePage implements OnInit {

  private apollo = inject(Apollo);
  auth           = inject(AuthService);
  private fb     = inject(FormBuilder);

  profileLoading = signal(false);
  profileSuccess = signal('');
  profileError   = signal('');

  passwordLoading = signal(false);
  passwordSuccess = signal('');
  passwordError   = signal('');

  profileForm = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.group({
    currentPassword:    ['', Validators.required],
    newPassword:        ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', Validators.required],
  });

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.profileForm.patchValue({ name: user.name, email: user.email });
    }
  }

  submitProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.profileLoading.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');

    const { name, email } = this.profileForm.getRawValue();
    this.apollo.mutate<{ updateProfile: AuthPayload }>({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: { input: { name, email } },
    }).subscribe({
      next: (res) => {
        this.profileLoading.set(false);
        const payload = res.data?.updateProfile;
        if (payload) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          // Force reload signal by triggering logout+re-login cycle is too disruptive.
          // Instead update via the public setter exposed by auth service.
          // AuthService doesn't expose a public setter, so we use the persist approach:
          // Store new token and navigate to reload auth state.
          (this.auth as any)._user?.set(payload);
          this.profileSuccess.set('Profile updated successfully.');
        }
      },
      error: (err) => {
        this.profileLoading.set(false);
        this.profileError.set(err.graphQLErrors?.[0]?.message ?? err.message ?? 'Failed to update profile.');
      },
    });
  }

  submitPassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    const { newPassword, confirmNewPassword, currentPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmNewPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }
    this.passwordLoading.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');

    this.apollo.mutate<{ changePassword: boolean }>({
      mutation: CHANGE_PASSWORD_MUTATION,
      variables: { currentPassword, newPassword },
    }).subscribe({
      next: (res) => {
        this.passwordLoading.set(false);
        if (res.data?.changePassword) {
          this.passwordSuccess.set('Password changed successfully.');
          this.passwordForm.reset();
        } else {
          this.passwordError.set('Failed to change password.');
        }
      },
      error: (err) => {
        this.passwordLoading.set(false);
        this.passwordError.set(err.graphQLErrors?.[0]?.message ?? err.message ?? 'Failed to change password.');
      },
    });
  }
}

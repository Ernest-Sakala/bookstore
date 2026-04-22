import { Component } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../service/auth';


/** Cross-field validator: password must match confirmPassword */
function passwordsMatch(g: AbstractControl) {
  return g.get('password')?.value === g.get('confirmPassword')?.value
    ? null
    : { mismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {



  form: FormGroup;
  loading  = false;
  error    = '';
  success  = '';
  showPwd  = false;
  showCPwd = false;

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Redirect away if already logged in
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);

    this.form = this.fb.group({
      name:            ['', [Validators.required, Validators.minLength(2)]],
      email:           ['', [Validators.required, Validators.email]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  // Shorthand getters for template
  get name()            { return this.form.get('name')!; }
  get email()           { return this.form.get('email')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.error   = '';

    this.auth.register(
      this.name.value.trim(),
      this.email.value.trim().toLowerCase(),
      this.password.value
    ).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting…';
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.loading = false;
        // Apollo wraps GQL errors in err.graphQLErrors[0].message
        this.error = err.graphQLErrors?.[0]?.message
          ?? err.message
          ?? 'Registration failed. Please try again.';
      }
    });
  }

}

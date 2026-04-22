import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../service/auth';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {


  form: FormGroup;
  loading   = false;
  error     = '';
  showPwd   = false;
  returnUrl = '/';

  constructor(
    private fb:    FormBuilder,
    private auth:  AuthService,
    private router: Router,
    private route:  ActivatedRoute
  ) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/']);

    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';

    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.error   = '/';

    this.auth.login(
      this.email.value.trim().toLowerCase(),
      this.password.value
    ).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: (err) => {
        this.loading = false;
        this.error   = err.graphQLErrors?.[0]?.message
          ?? err.message
          ?? 'Invalid email or password.';
      }
    });
  }

}

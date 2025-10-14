import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], // ahora sí coincide
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  isInvalid(ctrl: string) {
    const c = this.loginForm.get(ctrl);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  showError(ctrl: string, err: string) {
    const c = this.loginForm.get(ctrl);
    return !!(c && c.hasError(err) && (c.touched || c.dirty));
  }

  markTouched(ctrl: string) {
    this.loginForm.get(ctrl)?.markAsTouched();
  }

  onSubmit(): void {
    if (!this.loginForm.valid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas';
        console.error(err);
        this.loading = false;

        // REGISTRAR INTENTO FALLIDO EN BITÁCORA
        this.authService.registrarIntentoFallido(email);
      },
      complete: () => (this.loading = false),
    });
  }
}

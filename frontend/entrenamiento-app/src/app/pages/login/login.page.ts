import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSpinner } from '@ionic/angular';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { mensajeDeError } from '../../core/utils/errores';
import { MarcaComponent } from '../../shared/components/marca/marca.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [IonContent, IonInput, IonButton, IonSpinner, ReactiveFormsModule, RouterLink, MarcaComponent],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  readonly enviando = signal(false);
  readonly error = signal<string | null>(null);

  entrar(): void {
    if (this.form.invalid) {
      this.error.set('Completá tu email y tu contraseña.');
      return;
    }
    this.error.set(null);
    this.enviando.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth
      .login(email, password)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/entrenar', { replaceUrl: true }),
        error: (e) => this.error.set(mensajeDeError(e)),
      });
  }
}
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  hidePassword = true;

  private googleLoginHandler = () => this.onGoogleLoginSuccess();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  /** Login normal */
  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      const success = this.authService.login(email, password);

      if (success) {
        Swal.fire({
          icon: 'success',
          title: '✅ Sesión iniciada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.router.navigate(['/home']);
      } else {
        Swal.fire({
          icon: 'error',
          title: '❌ Credenciales inválidas',
          text: 'Revisa tu email o contraseña'
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  /** Renderizar el botón de Google cuando el componente carga */
  ngAfterViewInit(): void {
    this.authService.initGoogle();
    this.authService.renderGoogleButton('google-btn');

    // Escuchar el evento emitido por el servicio
    window.addEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  /** Limpiar el listener cuando se destruya el componente */
  ngOnDestroy(): void {
    window.removeEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  /** Se llama desde el servicio cuando el login Google es correcto */
  onGoogleLoginSuccess() {
    Swal.fire({
      icon: 'success',
      title: '✅ Sesión iniciada con Google',
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/home']);
  }
}

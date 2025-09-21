import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/auth/services/user.service';
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
    private userService: UserService,
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

  /** Login normal con backend/localStorage */
  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.userService.loginUser({ email, password }).subscribe({
        next: (resp) => {
          Swal.fire({
            icon: 'success',
            title: '✅ Sesión iniciada correctamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/home']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: '❌ Credenciales inválidas',
            text: err.error?.message || 'Revisa tu email o contraseña'
          });
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  /** Renderizar el botón de Google al cargar el componente */
  ngAfterViewInit(): void {
    this.userService.initGoogle();
    this.userService.renderGoogleButton('google-btn');
    window.addEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  /** Limpiar listener al destruir el componente */
  ngOnDestroy(): void {
    window.removeEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  /** Cuando Google login fue exitoso */
  onGoogleLoginSuccess() {
    const googleUser = this.userService.getUser(); // ✅ ya lo tenemos desde UserService.setUser()

    if (!googleUser) {
      Swal.fire({
        icon: 'error',
        title: 'Error con Google Login',
        text: 'No se pudo obtener la información del usuario',
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '✅ Sesión iniciada con Google',
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/home']);
  }
}

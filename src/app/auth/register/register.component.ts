import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  form: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  private googleLoginHandler = () => this.onGoogleRegisterSuccess();

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, this.validDomain]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  validDomain(control: AbstractControl) {
    if (!control.value) return null;
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
    const domain = control.value.split('@')[1];
    return allowedDomains.includes(domain) ? null : { invalidDomain: true };
  }

  passwordsMatch(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.valid) {
      this.authService.register(this.form.value);
      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      this.router.navigate(['/login']);
    } else {
      this.form.markAllAsTouched();
    }
  }

  /** Renderizar botón de Google */
  ngAfterViewInit(): void {
    this.authService.initGoogle();
    this.authService.renderGoogleButton('google-btn-register');

    // Escuchar evento cuando login Google es correcto
    window.addEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('googleLoginSuccess', this.googleLoginHandler);
  }

  /** Cuando se loguea con Google en registro */
  onGoogleRegisterSuccess() {
    Swal.fire({
      icon: 'success',
      title: '✅ Registro con Google exitoso',
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/home']);
  }
}

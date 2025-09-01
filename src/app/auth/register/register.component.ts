import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      document: ['', [Validators.required, Validators.pattern(/^[0-9]{6,15}$/)]],
      document_type: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      last_name1: ['', [Validators.required, Validators.minLength(2)]],
      last_name2: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, this.validDomain]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      role: ['user'], // ⚡ por defecto user
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  // ✅ Validar dominio de email (solo gmail, outlook, yahoo)
  validDomain(control: AbstractControl) {
    if (!control.value) return null;
    const allowedDomains = ['gmail.com', 'outlook.com', 'yahoo.com'];
    const domain = control.value.split('@')[1];
    return allowedDomains.includes(domain) ? null : { invalidDomain: true };
  }

  // ✅ Validar contraseñas iguales
  passwordsMatch(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  // ✅ Acceso rápido a los formControls en el HTML
  get f() {
    return this.form.controls;
  }

  // 🚀 Enviar datos al backend
  submit() {
    if (this.form.valid) {
      const {
        document,
        document_type,
        name,
        last_name1,
        last_name2,
        email,
        phone,
        role,
        password,
        confirmPassword
      } = this.form.value;

      this.userService.createUser({
        document,
        document_type,
        name,
        last_name1,
        last_name2,
        email,
        phone,
        role,
        password,
        re_password: confirmPassword // 👈 así lo pide tu backend
      }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario registrado correctamente',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar usuario',
            text: err.error?.message || 'Intenta nuevamente',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      this.form.markAllAsTouched();
    }
  }
}

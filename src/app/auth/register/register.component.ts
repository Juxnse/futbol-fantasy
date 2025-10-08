import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
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
      role: ['user'],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  get f() { return this.form.controls; }

  validDomain(control: AbstractControl) {
    const allowed = ['gmail.com', 'outlook.com', 'yahoo.com'];
    const domain = control.value?.split('@')[1];
    return allowed.includes(domain) ? null : { invalidDomain: true };
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  submit() {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const user = this.form.value;
    this.userService.createUser(user).subscribe({
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
          text: err.message
        });
      }
    });
  }
}

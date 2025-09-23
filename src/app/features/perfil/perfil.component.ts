import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../../app/auth/services/user.service';
import { User } from '../../../app/auth/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: User | null = null;
  loading = false;
  avatarPreview: string | null = null; // base64 para vista previa

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }], // editable solo si provider=local
    picture: [''], // base64/string URL
  });

  get isGoogle() { return this.user?.provider === 'google'; }

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
  // Estado actual “reactivo”
  this.userService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe(u => {
      this.user = u;
      this.form.patchValue({
        name: u?.name ?? '',
        email: u?.email ?? '',
        picture: u?.picture ?? '',
      });
      this.avatarPreview = u?.picture ?? null;

      if (u?.provider === 'local') this.form.get('email')?.enable();
      else this.form.get('email')?.disable();
    });

  // ✅ Solo intenta refrescar desde backend si el provider es "local"
  const u0 = this.userService.getUser();
  if (u0?.provider === 'local' && this.userService.getToken()) {
    // modo soft: no cierra la sesión si falla
    this.userService.getLoggedUser({ soft: true }).subscribe();
  }
}


  onPickAvatar(input: HTMLInputElement) { input.click(); }

  onAvatarSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.avatarPreview = base64;
      this.form.patchValue({ picture: base64 });
    };
    reader.readAsDataURL(file);
  }

  async save() {
    if (!this.user) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: Partial<User> = {
      name: this.form.value.name!,
      // email: (this.isGoogle ? this.user.email : this.form.value.email!) // si quieres permitir email local
      picture: this.form.value.picture || this.avatarPreview || this.user.picture,
    };

    this.loading = true;

    // 1) Si hay id => intenta actualizar en backend
    if (this.user.id) {
      this.userService.updateUser(this.user.id, payload).subscribe({
        next: () => this.finishOk(payload),
        error: () => this.finishLocal(payload), // si falla backend, al menos actualiza localmente
      });
      return;
    }

    // 2) Sin id (p.ej. login Google sin intercambio) => actualiza local
    this.finishLocal(payload);
  }

  private finishOk(patch: Partial<User>) {
    this.loading = false;
    this.userService.applyUserPatch(patch); // actualiza estado/localStorage
    Swal.fire({ icon: 'success', title: 'Perfil actualizado', timer: 1400, showConfirmButton: false });
  }

  private finishLocal(patch: Partial<User>) {
    this.loading = false;
    this.userService.applyUserPatch(patch);
    Swal.fire({
      icon: 'success',
      title: 'Perfil actualizado (local)',
      text: 'Se actualizará en el servidor cuando inicies sesión con backend.',
      timer: 1600,
      showConfirmButton: false,
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}

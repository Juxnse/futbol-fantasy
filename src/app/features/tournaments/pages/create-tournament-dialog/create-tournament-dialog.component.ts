import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TournamentService } from '../../services/tournament.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-tournament-dialog',
  templateUrl: './create-tournament-dialog.component.html',
  styleUrls: ['./create-tournament-dialog.component.scss']
})
export class CreateTournamentDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: TournamentService,
    private dialogRef: MatDialogRef<CreateTournamentDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      visibility: ['PUBLIC', Validators.required],
      maxTeams: [10, [Validators.required, Validators.min(2)]],
      startAt: ['', Validators.required],
      endAt: ['', Validators.required],
    });
  }

  save() {
    if (this.form.invalid) return;

    const tournamentData = this.form.value;

    this.service.create(tournamentData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Torneo creado',
          text: `${tournamentData.name} fue creado con éxito`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.dialogRef.close(true);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el torneo. Intenta de nuevo.',
        });
      },
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

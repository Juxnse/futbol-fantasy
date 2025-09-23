import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PerfilRoutingModule } from './perfil-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PerfilComponent } from './perfil.component';

@NgModule({
  declarations: [PerfilComponent],
  imports: [
    CommonModule, ReactiveFormsModule, PerfilRoutingModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule
  ],
})
export class PerfilModule {}


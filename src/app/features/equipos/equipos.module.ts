import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';

import { EquiposRoutingModule } from './equipos-routing.module';
import { TeamComponent } from './pages/team/team.component';

@NgModule({
  declarations: [TeamComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    EquiposRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class EquiposModule {}

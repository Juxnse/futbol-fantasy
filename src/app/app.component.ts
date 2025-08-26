import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'futbol-fantasy';
  opened = false; // Estado inicial del menú (cerrado)

  @ViewChild('drawer') drawer!: MatSidenav;

  toggleMenu() {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }
}

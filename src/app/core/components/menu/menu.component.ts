import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  constructor(private userService: UserService, private router: Router) {}

  openTeam() {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/team']);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acceso restringido',
        text: 'Debes iniciar sesión para armar tu equipo',
        confirmButtonText: 'Entendido'
      });
    }
  }
}

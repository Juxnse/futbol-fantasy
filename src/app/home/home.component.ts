import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public userService: UserService) {}

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  logout() {
    this.userService.logoutUser();
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has salido de tu cuenta',
      timer: 2000,
      showConfirmButton: false
    });
  }

  players = [
    { number: 1, x: 300, y: 750, color: 'red' },
    { number: 2, x: 200, y: 600, color: 'blue' },
    { number: 3, x: 260, y: 600, color: 'blue' },
    { number: 4, x: 340, y: 600, color: 'blue' },
    { number: 5, x: 400, y: 600, color: 'blue' },
    { number: 6, x: 220, y: 400, color: 'yellow' },
    { number: 7, x: 300, y: 400, color: 'yellow' },
    { number: 8, x: 380, y: 400, color: 'yellow' },
    { number: 9, x: 240, y: 200, color: 'orange' },
    { number: 10, x: 300, y: 200, color: 'orange' },
    { number: 11, x: 360, y: 200, color: 'orange' },
  ];
}

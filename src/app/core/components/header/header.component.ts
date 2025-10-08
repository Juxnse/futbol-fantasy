import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from 'src/app/auth/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  user: User | null = null;

  constructor(public userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUser();

    // Si cambia el localStorage (ej. Google login), refresca usuario
    window.addEventListener('storage', () => this.loadUser());
    this.router.events.subscribe(() => this.loadUser());
  }

  loadUser() {
    this.user = this.userService.getUser();
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  logout() {
    this.userService.logout();
    this.user = null;
    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      timer: 2000,
      showConfirmButton: false
    });
    this.router.navigate(['/home']);
  }
}

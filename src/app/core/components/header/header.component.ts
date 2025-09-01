import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  user: any = null;

  constructor(public userService: UserService, private router: Router) {}

  ngOnInit() {
    this.loadUser();
    // Reactivar datos si cambia localStorage (ej. Google login)
    window.addEventListener('storage', () => this.loadUser());
    this.router.events.subscribe(() => this.loadUser());
  }

  loadUser() {
    this.user = this.userService.getUserFromLocal();
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  logout() {
    this.userService.logoutUser();
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

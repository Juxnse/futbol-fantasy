import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  user: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUser();
    window.addEventListener('storage', () => this.loadUser());
    this.router.events.subscribe(() => this.loadUser());
  }

  loadUser() {
    const userStr = localStorage.getItem('ff_user');
    this.user = userStr ? JSON.parse(userStr) : null;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
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

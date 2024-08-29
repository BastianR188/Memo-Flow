import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userId: string = '';
  password: string = '';

  constructor(private router: Router, private authService: AuthService) { }
  async login() {
    if (await this.authService.login(this.userId, this.password)) {
      this.router.navigate(['/notes', this.userId]);
    } else {
      alert('Invalid credentials');
    }
  }
  loginWithGoogle() {
    this.authService.signInWithGoogle();
  }
}

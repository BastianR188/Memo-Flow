import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;

  constructor(private router: Router) {
    // Überprüfen Sie beim Start, ob ein Token im localStorage vorhanden ist
    this.isAuthenticated = !!localStorage.getItem('authToken');
  }

  login(userId: string, password: string): boolean {
    // Hier sollten Sie die tatsächliche Authentifizierungslogik implementieren
    // Dies ist nur ein Beispiel
    if (userId && password) {
      this.isAuthenticated = true;
      localStorage.setItem('authToken', 'some-auth-token');
      localStorage.setItem('userId', userId);
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
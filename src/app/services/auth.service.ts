import { inject, Injectable } from '@angular/core';
import { signInWithRedirect } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, getRedirectResult } from 'firebase/auth';
import { userData } from '../model/note';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false;
  private user: userData | null = null;
  private readonly JWT_SECRET = 'your-secret-key'; // Besser aus Umgebungsvariablen laden

  constructor(private router: Router) {}

  async login(userId: string, password: string): Promise<string | null> {
    const user = await this.getUserFromDatabase(userId);

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      this.isAuthenticated = true;
      this.user = user;
      
      const token = this.generateJWT(user);
      
      // Token zurückgeben statt in localStorage zu speichern
      return token;
    }
    return null;
  }

  private async getUserFromDatabase(userId: string): Promise<userData | null> {
    // Hier sollte die tatsächliche Datenbankabfrage implementiert werden
    // Dies ist nur ein Beispiel
    const mockUser: userData = {
      userId: userId,
      noteIds: [],
      labelIds: [],
      darkMode: false,
      passwordHash: await bcrypt.hash('password123', 10),
      username: 'testUser'
    };
    return mockUser;
  }

  private generateJWT(user: userData): string {
    return jwt.sign(
      { userId: user.userId, username: user.username },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, this.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    this.isAuthenticated = false;
    this.user = null;
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
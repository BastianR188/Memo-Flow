import { inject, Injectable } from '@angular/core';
import { signInWithRedirect } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, getRedirectResult } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firestore: Firestore = inject(Firestore);

  private isAuthenticated = false;
  private user: User | null = null;

  constructor(private router: Router) {
   
    this.isAuthenticated = !!localStorage.getItem('authToken');

  }

  async login(userId: string, password: string): Promise<boolean> {
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


  signInWithGoogle() {
    const provider = new GoogleAuthProvider();

    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // The signed-in user info.
        const user = result.user;
        // this.addUserToFirestore(user, statusValue);
        this.router.navigate(['/notes', result.user.uid]);
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Sign In With Google Errors', errorCode, errorMessage)
      });
  }
  
  logout() {
    this.isAuthenticated = false;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    getAuth().signOut();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string | null {
    return this.user ? this.user.uid : localStorage.getItem('userId');
  }
}

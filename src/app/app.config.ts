import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"memoflow-65786","appId":"1:138143599983:web:86b847ff63810ef84c2c9a","storageBucket":"memoflow-65786.appspot.com","apiKey":"AIzaSyDHZqPuJ3PZ3auol1Gu_XXoTr5z1bbPRb4","authDomain":"memoflow-65786.firebaseapp.com","messagingSenderId":"138143599983"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage()), provideAnimationsAsync(), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"memoflow-65786","appId":"1:138143599983:web:86b847ff63810ef84c2c9a","storageBucket":"memoflow-65786.appspot.com","apiKey":"AIzaSyDHZqPuJ3PZ3auol1Gu_XXoTr5z1bbPRb4","authDomain":"memoflow-65786.firebaseapp.com","messagingSenderId":"138143599983"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};

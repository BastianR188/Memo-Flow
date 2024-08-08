import { Routes } from '@angular/router';
import { LoginComponent } from './components/login-component/login.component';
import { AuthGuard } from './services/auth.guard';
import { MainPageComponent } from './components/main-content/main-page/main-page.component';
import { TrashComponent } from './components/main-content/trash/trash.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'notes/:id', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'trash/:id', component: TrashComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

];

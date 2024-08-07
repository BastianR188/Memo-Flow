import { Routes } from '@angular/router';
import { NotesListComponent } from './components/main-content/notes-list/notes-list.component';
import { LoginComponent } from './components/login-component/login.component';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'notes/:id', component: NotesListComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },

];

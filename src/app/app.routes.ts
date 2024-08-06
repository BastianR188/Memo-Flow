import { Routes } from '@angular/router';
import { NotesListComponent } from './components/main-content/notes-list/notes-list.component';
import { NoteComponent } from './components/main-content/note/note.component';
import { ChecklistComponent } from './components/main-content/checklist/checklist.component';
import { CreateNoteComponent } from './components/main-content/create/create-note.component';
import { LabelManagerComponent } from './components/main-content/label-manager/label-manager.component';
import { AttachmentComponent } from './components/main-content/attachment/attachment.component';

export const routes: Routes = [
    { path: '', redirectTo: '/notes', pathMatch: 'full' },
    { path: 'notes', component: NotesListComponent },
    { path: 'note/:id', component: NoteComponent },
    { path: 'checklist/:id', component: ChecklistComponent },
    { path: 'create', component: CreateNoteComponent },
    { path: 'labels', component: LabelManagerComponent },
    { path: 'attachment/:id', component: AttachmentComponent },
    { path: '**', redirectTo: '/notes' }  // Wildcard route for a 404 page
];

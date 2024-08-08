import { Component } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { CommonModule } from '@angular/common';
import { TrashNoteComponent } from '../trash-note/trash-note.component';

@Component({
  selector: 'app-trash',
  standalone: true,
  imports: [CommonModule, TrashNoteComponent],
  templateUrl: './trash.component.html',
  styleUrl: './trash.component.scss'
})
export class TrashComponent {
  constructor(public noteService: NoteService) { }
  deleteAllNotes() {
    this.noteService.deletedNotes.forEach((note) => {
      this.noteService.deleteNotePermanently(note.id)
    })
  }
}

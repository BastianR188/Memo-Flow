import { Component, Input } from '@angular/core';
import { Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-trash-note',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trash-note.component.html',
  styleUrl: './trash-note.component.scss'
})
export class TrashNoteComponent {
  constructor(public noteService: NoteService) {}
  @Input() note!: Note;
}

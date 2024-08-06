import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../services/note.service';
import { Note } from '../../../model/note';
import { NoteComponent } from '../note/note.component';

@Component({
  selector: 'app-notes-list-component',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteComponent],
  providers: [DatePipe, NoteService], // Stelle DatePipe und NoteService hier bereit
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.scss'
})
export class NotesListComponent implements OnInit {
  title: string = '';
  note: string = '';
  isChecklist: boolean = false;
  isPinned: boolean = false;
  checklistItems: { text: string, checked: boolean }[] = [];
  selectedColor: string = '';
  attachments: File[] = [];

  notes: Note[] = [];

  constructor(private noteService: NoteService) { }

  ngOnInit() {
    this.noteService.getNotes().subscribe(notes => {
      this.notes = notes;
    });
  }

  addChecklistItem() {
    this.checklistItems.push({ text: '', checked: false });
  }

  removeChecklistItem(index: number) {
    this.checklistItems.splice(index, 1);
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.attachments = Array.from(fileList);
    }
  }

  submit() {
    this.noteService.submit(
      this.title,
      this.isChecklist ? '' : this.note,
      this.isChecklist,
      this.checklistItems,
      this.selectedColor,
      this.isPinned,
      this.attachments
    );

    // Reset form
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.checklistItems = [];
    this.selectedColor = '';
    this.attachments = [];
  }
}

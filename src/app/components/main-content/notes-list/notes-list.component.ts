import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../services/note.service';
import { NoteComponent } from '../note/note.component';
import { AttachmentService } from '../../../services/attachment.service';
import { ImageAttachment, Note } from '../../../model/note';
import { ChecklistService } from '../../../services/checklist.service';

@Component({
  selector: 'app-notes-list-component',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteComponent],
  providers: [DatePipe, NoteService], // Stelle DatePipe und NoteService hier bereit
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.scss'
})
export class NotesListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  title: string = '';
  note: string = '';
  isChecklist: boolean = false;
  isPinned: boolean = false;
  checklistItems: { text: string, checked: boolean }[] = [];
  selectedColor: string = '';
  attachments: ImageAttachment[] = [];
  pinnedNotes: Note[] = [];
  unpinnedNotes: Note[] = [];

  newNote: Note = {
    title: '',
    content: '',
    isChecklist: false,
    checklistItems: [],
    color: '',
    isPinned: false,
    createdAt: new Date(),
    attachments: []
  };

  constructor(
    private noteService: NoteService,
    private attachmentService: AttachmentService,
    private checklistService: ChecklistService
  ) { }

  ngOnInit() {
    this.noteService.getNotes().subscribe(notes => {
      this.sortNotes(notes);
    });
  }

  loadNotes() {
    this.noteService.getNotes().subscribe(notes => {
      this.sortNotes(notes);
    });
  }

  addChecklistItem() {
    this.checklistService.addChecklistItem(this.newNote);
  }

  sortNotes(notes: Note[]) {
    this.pinnedNotes = notes.filter(note => note.isPinned);
    this.unpinnedNotes = notes.filter(note => !note.isPinned);
  }

  removeChecklistItem(index: number) {
    this.checklistService.removeChecklistItem(this.newNote, index);
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.attachments = await this.attachmentService.handleFileSelection(fileList);
    }
  }

  submit() {
    this.newNote.title = this.title;
    this.newNote.content = this.isChecklist ? '' : this.note;
    this.newNote.isChecklist = this.isChecklist;
    this.newNote.color = this.selectedColor;
    this.newNote.isPinned = this.isPinned;
    this.newNote.attachments = this.attachments;

    this.noteService.addNote(this.newNote);

    // Aktualisiere die Notizen nach dem Hinzufügen
    this.loadNotes();

    // Reset form
    this.resetForm();
  }

  resetForm() {
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.selectedColor = '';
    this.attachments = [];
    this.newNote = {
      title: '',
      content: '',
      isChecklist: false,
      checklistItems: [],
      color: '',
      isPinned: false,
      createdAt: new Date(),
      attachments: []
    };
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onPinStatusChanged() {
    this.loadNotes();
  }
}

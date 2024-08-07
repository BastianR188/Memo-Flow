import { Injectable } from '@angular/core';
import { ChecklistItem, Note } from '../model/note';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  // CRUD-Operationen für Notizen und Checklisten
  // Synchronisation mit Firebase

  private notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);

  constructor() { }

  getNotes(): Observable<Note[]> {
    return this.notesSubject.asObservable();
  }

  newId(): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      id += charset[randomIndex];
    }
    return id;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  addNote(note: Note): void {
    note.id = this.newId();
    note.createdAt = new Date();
    this.notes.push(note);
    this.notesSubject.next([...this.notes]);
  }

  updateNote(updatedNote: Note): void {
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
      this.notes[index] = updatedNote;
      this.notesSubject.next([...this.notes]);
    }
  }

  submit(title: string, content: string, isChecklist: boolean, checklistItems: { text: string, checked: boolean }[], color: string, isPinned: boolean, attachments: File[]) {
    const formattedChecklistItems: ChecklistItem[] = checklistItems.map((item, index) => ({
      order: index,
      text: item.text,
      checked: item.checked
    }));

    const note = new Note({
      title,
      content,
      isChecklist,
      checklistItems: formattedChecklistItems,
      color,
      isPinned,
      attachments: attachments.map(file => file.name)
    });
    this.addNote(note);
    console.log('Neue Notiz hinzugefügt:', note);
  }
}

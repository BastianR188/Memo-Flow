import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../model/note';
import { OfflineStorageService } from './offline-storage.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);
  userId: string | null = null;
  openTrash: boolean = false;
  pinnedNotes: Note[] = [];
  unpinnedNotes: Note[] = [];
  deletedNotes: Note[] = [];

  constructor(private offlineStorage: OfflineStorageService) { }

  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadNotes();
  }

  sortNotes(notes: Note[]) {
    this.pinnedNotes = notes.filter(note => note.isPinned && !note.delete);
    this.unpinnedNotes = notes.filter(note => !note.isPinned && !note.delete);
    this.deletedNotes = notes.filter(note => note.delete);
  }

  private async loadNotes() {
    if (this.userId) {
      this.notes = await this.offlineStorage.getUserNotes(this.userId);
      this.notesSubject.next(this.notes);
    }
  }

  getNotes(): Observable<Note[]> {
    return this.notesSubject.asObservable();
  }

  async addNote(note: Note): Promise<void> {
    if (!this.userId) throw new Error('User not set');
    note.id = this.newId();
    note.createdAt = new Date();
    note.editAt = new Date();
    this.notes.push(note);
    await this.saveNotes();
    this.notesSubject.next([...this.notes]);
  }

  async updateNote(updatedNote: Note): Promise<void> {
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
      updatedNote.editAt = new Date();
      this.notes[index] = updatedNote;
      await this.saveNotes();
      this.notesSubject.next([...this.notes]);
    }
  }

  async deleteNote(id: string): Promise<void> {
    this.notes = this.notes.filter(note => note.id !== id);
    await this.saveNotes();
    this.notesSubject.next([...this.notes]);
  }

  private async saveNotes(): Promise<void> {
    if (this.userId) {
      await this.offlineStorage.saveUserNotes(this.userId, this.notes);
    } else {
      console.log('UserId nicht gefunden! Es wurde nicht gespeichert!')
    }
  }

  newId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async deleteNotePermanently(noteId: string) {
    await this.deleteNote(noteId);
    this.loadNotes();
  }

  async moveToTrash(note: Note) {
    note.delete = true;
    note.editAt = new Date();
    await this.updateNote(note);
    this.loadNotes();
  }

  async restoreNoteFromTrash(note: Note) {
    note.delete = false;
    note.editAt = new Date();
    await this.updateNote(note);
    this.loadNotes();
  }
}

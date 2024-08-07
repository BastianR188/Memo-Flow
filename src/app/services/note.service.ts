import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChecklistItem, ImageAttachment, Note } from '../model/note';
import { OfflineStorageService } from './offline-storage.service';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  // CRUD-Operationen für Notizen und Checklisten
  // Synchronisation mit Firebase

  private notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);
  private userId: string | null = null;

  constructor(private offlineStorage: OfflineStorageService) { }

  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadNotes();
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

  async addNote(note: Note): Promise<void> {
    if (!this.userId) throw new Error('User not set');
    note.id = this.newId();
    note.createdAt = new Date();
    this.notes.push(note);
    await this.saveNotes();
    this.notesSubject.next([...this.notes]);
  }

  async updateNote(updatedNote: Note): Promise<void> {
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
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
    }
  }

}

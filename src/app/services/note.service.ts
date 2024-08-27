import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Note } from '../model/note';
import { OfflineStorageService } from './offline-storage.service';
import { FirebaseService } from './firebase.service';
import { LabelService } from './label.service';
import { DataSyncService } from './data-sync.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  notes: Note[] = [];
  private notesSubject = new BehaviorSubject<Note[]>([]);
  
  userId: string = '';
  openTrash: boolean = false;
  pinnedNotes: Note[] = [];
  unpinnedNotes: Note[] = [];
  deletedNotes: Note[] = [];
  selectedLabel: string = '';
  notes$ = this.notesSubject.asObservable();
  constructor(private offlineStorage: OfflineStorageService, private labelService: LabelService, private dataSync: DataSyncService) { }

  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadNotes();
  }

  getAlId() {
    let noteIds: string[] = [];
    let labelIds: string[] = [];
  
    this.notes.forEach((item) => {
      noteIds.push(item.id);
    });
  
    this.labelService.labels.forEach((item) => {
      labelIds.push(item.id);
    });
  
    let data = {
      noteIds: noteIds,
      labelIds: labelIds,
      userId: this.userId
    };
  
    return data;
  }

  sortNotes(notes: Note[]) {
    const filteredNotes = this.selectedLabel 
      ? notes.filter(note => note.labels.some(label => label.id === this.selectedLabel))
      : notes;
    this.pinnedNotes = filteredNotes
      .filter(note => note.isPinned && !note.delete)
      .sort((a, b) => a.order - b.order);
    this.unpinnedNotes = filteredNotes
      .filter(note => !note.isPinned && !note.delete)
      .sort((a, b) => a.order - b.order);
    this.deletedNotes = notes.filter(note => note.delete);
  }

  setSelectedLabel(labelId: string) {
    this.selectedLabel = labelId;
    this.sortNotes(this.notes);
    this.notesSubject.next([...this.pinnedNotes, ...this.unpinnedNotes, ...this.deletedNotes]);
  }

  clearSelectedLabel() {
    this.selectedLabel = '';
    this.sortNotes(this.notes);
    this.notesSubject.next([...this.pinnedNotes, ...this.unpinnedNotes, ...this.deletedNotes]);
  }

  private async loadNotes() {
    if (this.userId) {
      this.notes = await this.offlineStorage.getUserNotes(this.userId) as Note[];
      this.notesSubject.next(this.notes);
    }
  }

  private async saveNotes(notes:Note[]): Promise<void> {
    if (this.userId) {
      await this.offlineStorage.saveUserNotes(this.userId, notes);
    } else {
      console.log('UserId nicht gefunden! Es wurde nicht gespeichert!')
    }
  }
  async removeLabelFromAllNotes(labelId: string) {
    const notes = this.getCurrentNotes();
    const updatedNotes = notes.map(note => {
      if (note.labels && note.labels.some(label => label.id === labelId)) {
        return {
          ...note,
          labels: note.labels.filter(label => label.id !== labelId)
        };
      }
      return note;
    });

    await this.updateOfflineAllNotes(this.userId, updatedNotes);
  }
  // Methode, um das Observable zu erhalten
  getNotes(): Observable<Note[]> {
    return this.notes$;
  }

  // Methode, um den aktuellen Wert zu erhalten
  getCurrentNotes(): Note[] {
    return this.notesSubject.getValue();
  }

  async updateOfflineAllNotes(userId: string, newNotes: Note[]) {
    this.notesSubject.next(newNotes);
    await this.offlineStorage.saveUserNotes(userId, newNotes);
  }

  async updateAllNotes(userId:string, newNotes: Note[]) {
    const currentNotes = this.notesSubject.getValue();
    const updatedNotes = this.dataSync.mergeAndUpdateItems<Note>(currentNotes, newNotes);
    this.notesSubject.next(updatedNotes);
    await this.offlineStorage.saveUserNotes(userId, updatedNotes);
  }

  async addNote(note: Note): Promise<void> {
    if (!this.userId) throw new Error('User not set');
    this.notes.push(note);
    await this.saveNotes(this.notes);
    this.notesSubject.next([...this.notes]);
  }

  async updateNote(updatedNote: Note): Promise<void> {
    const index = this.notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
      updatedNote.editAt = new Date();
      this.notes[index] = updatedNote;
      await this.saveNotes(this.notes);
      this.notesSubject.next([...this.notes]);
    }
  }

  async deleteNote(id: string): Promise<void> {
    this.notes = this.notes.filter(note => note.id !== id);
    await this.saveNotes(this.notes);
    this.notesSubject.next([...this.notes]);
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

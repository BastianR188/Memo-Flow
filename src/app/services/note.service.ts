import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Label, Note } from '../model/note';
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
  darkMode: boolean = false;
  userId: string = '';
  pinnedNotes: Note[] = [];
  unpinnedNotes: Note[] = [];
  deletedNotes: Note[] = [];
  notes$ = this.notesSubject.asObservable();
  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  filteredPinnedNotes$: Observable<Note[]>;
  filteredUnpinnedNotes$: Observable<Note[]>;
  constructor(private offlineStorage: OfflineStorageService, private labelService: LabelService, private dataSync: DataSyncService) {
    const filteredNotes$ = combineLatest([
      this.notes$,
      this.selectedLabel$,
      this.searchTerm$
    ]).pipe(
      map(([notes, selectedLabel, searchTerm]) => {
        return this.filterAndSortNotes(notes, selectedLabel, searchTerm);
      })
    );

    this.filteredPinnedNotes$ = filteredNotes$.pipe(
      map(notes => notes.filter(note => note.isPinned))
    );

    this.filteredUnpinnedNotes$ = filteredNotes$.pipe(
      map(notes => notes.filter(note => !note.isPinned))
    );
  }
  getNoteAndLabelIds(): { noteIds: string[], labelIds: string[] } {
    const noteIds = this.notes.map(note => note.id);
    const labelIds = this.labelService.labelsSubject.value.map(label => label.id);
    return { noteIds, labelIds };
  }


  clearSearchTerm() {
    this.searchTermSubject.next('');
  }

  private selectedLabelSubject = new BehaviorSubject<string>('');
  selectedLabel$ = this.selectedLabelSubject.asObservable();

  private openTrashSubject = new BehaviorSubject<boolean>(false);
  openTrash$ = this.openTrashSubject.asObservable();

  get selectedLabel(): string {
    return this.selectedLabelSubject.value;
  }

  set selectedLabel(value: string) {
    this.selectedLabelSubject.next(value);
  }

  get openTrash(): boolean {
    return this.openTrashSubject.value;
  }

  set openTrash(value: boolean) {
    this.openTrashSubject.next(value);
  }

  setSearchTerm(term: string) {
    this.searchTermSubject.next(term);
  }

  private filterAndSortNotes(notes: Note[], selectedLabel: string, searchTerm: string): Note[] {
    const filteredNotes = notes.filter(note => {
      const matchesLabel = !selectedLabel || note.labels.some(label => label.id === selectedLabel);

      const matchesSearch = !searchTerm || this.noteMatchesSearch(note, searchTerm.toLowerCase());

      return matchesLabel && matchesSearch && !note.delete;
    });

    return filteredNotes.sort((a, b) => a.order - b.order);
  }

  private noteMatchesSearch(note: Note, searchTerm: string): boolean {
    // Überprüfe Titel und Inhalt
    if (note.title.toLowerCase().includes(searchTerm) ||
      note.content.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Überprüfe Checklisten-Items, falls vorhanden
    if (note.isChecklist && note.checklistItems) {
      return note.checklistItems.some(item =>
        item.text.toLowerCase().includes(searchTerm)
      );
    }

    // Optional: Überprüfe Labels
    if (note.labels && note.labels.length > 0) {
      return note.labels.some(label =>
        label.name.toLowerCase().includes(searchTerm)
      );
    }

    return false;
  }


  async setUserId(userId: string) {
    this.userId = userId;
    await this.loadNotes();
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
  getAlId(darkMode:boolean) {
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
      userId: this.userId,
      darkMode: darkMode
    };

    return data;
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

  private async saveNotes(notes: Note[]): Promise<void> {
    if (this.userId) {
      await this.offlineStorage.saveUserNotes(this.userId, notes);
    } else {
      console.log('UserId nicht gefunden! Es wurde nicht gespeichert!')
    }
  }
  async updateLabelsInAllNotes(updatedLabel: Label, isDeleted: boolean = false) {
    const notes = this.getCurrentNotes();
    const updatedNotes = notes.map(note => {
      if (note.labels && note.labels.some(label => label.id === updatedLabel.id)) {
        return {
          ...note,
          labels: isDeleted
            ? note.labels.filter(label => label.id !== updatedLabel.id)
            : note.labels.map(label =>
              label.id === updatedLabel.id
                ? { ...label, name: updatedLabel.name, color: updatedLabel.color }
                : label
            )
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
    console.log('Dies ist der jetzige user: ' + userId)
    this.notesSubject.next(newNotes);
    await this.offlineStorage.saveUserNotes(userId, newNotes);
  }

  async updateAllNotes(userId: string, newNotes: Note[]) {
    const currentNotes = this.notesSubject.getValue();
    const updatedNotes = this.dataSync.mergeAndUpdateItems<Note>(currentNotes, newNotes);
    this.notes = updatedNotes; // Aktualisieren Sie die notes Property
    this.notesSubject.next(updatedNotes);
    await this.offlineStorage.saveUserNotes(userId, updatedNotes);
  }
  
  async addNote(note: Note): Promise<void> {
    console.log('Dieser Note wird erstellt', note)
    if (!this.userId) throw new Error('User not set');
    this.clearSearchTerm()
    this.notes.push(note);
    await this.saveNotes(this.notes);
    this.notesSubject.next([...this.notes]);
  }

  async updateNote(updatedNote: Note, pinn: boolean): Promise<void> {
    updatedNote.editAt = new Date();
    const updatedNotes = this.notes.map(note =>
      note.id === updatedNote.id ? { ...note, ...updatedNote } : note
    );
    this.notes = updatedNotes;
    await this.saveNotes(this.notes);
    if (pinn) {
      this.notesSubject.next(this.notes);
      this.sortNotes(this.notes)
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
    await this.updateNote(note, false);
    this.loadNotes();
  }

  async restoreNoteFromTrash(note: Note) {
    note.delete = false;
    note.editAt = new Date();
    await this.updateNote(note, false);
    this.loadNotes();
  }
}

import { Injectable } from '@angular/core';
import { OfflineStorageService } from './offline-storage.service';
import { BehaviorSubject } from 'rxjs';
import { userData } from '../model/note';
import { NoteService } from './note.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  private userId: string | null = null;

  constructor(private offlineStorage: OfflineStorageService, private noteService: NoteService) { }

  setUserId(userId: string) {
    this.userId = userId;
    this.loadSettings();
  }

  private async loadSettings() {
    if (this.userId) {
      const settings = await this.offlineStorage.getUserSettings(this.userId);
      this.darkModeSubject.next(settings.darkMode);
    }
  }

  async setDarkMode(darkMode: boolean) {
    this.darkModeSubject.next(darkMode);
    // Optional: Speichern Sie die Einstellung auch lokal oder in Firebase
    if (this.userId) {
      await this.updateDarkMode(darkMode);
    }
  }

  toggleDarkMode() {
    const newDarkMode = !this.darkModeSubject.value;
    this.updateDarkMode(newDarkMode)
  }

  async updateDarkMode(newDarkMode: boolean) {
    if (this.userId) {
      const { noteIds, labelIds } = this.noteService.getNoteAndLabelIds();
      const settings: Omit<userData, 'userId'> = {
        noteIds,
        labelIds,
        darkMode: newDarkMode
      };
      await this.offlineStorage.saveUserSettings(this.userId, settings);
    }
    this.darkModeSubject.next(newDarkMode);
  }
}

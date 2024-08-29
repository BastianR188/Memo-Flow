import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Label, Note, userData } from '../model/note';

interface MyDB extends DBSchema {
  userSettings: {
    key: string;
    value: {
      userId: string;
      noteIds: string[];
      labelIds: string[];
      darkMode: boolean;
    }
  }
  userNotes: {
    key: string;
    value: {
      userId: string;
      notes: Note[];
    };
  };
  userLabels: {
    key: string;
    value: {
      userId: string;
      labels: Label[];
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private db: IDBPDatabase<MyDB> | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB() {
    if (!this.db) {
      this.db = await openDB<MyDB>('NotesApp', 3, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (!db.objectStoreNames.contains('userSettings')) {
            db.createObjectStore('userSettings', { keyPath: 'userId' });
          }
          if (!db.objectStoreNames.contains('userNotes')) {
            db.createObjectStore('userNotes', { keyPath: 'userId' });
          }
          if (!db.objectStoreNames.contains('userLabels')) {
            db.createObjectStore('userLabels', { keyPath: 'userId' });
          }
        },
      });
    }
  }
  
  async getUserNotes(userId: string): Promise<Note[]> {
    await this.initDB();
    const userNotes = await this.db!.get('userNotes', userId);
    return userNotes?.notes || [];
  }

  async getUserLabels(userId: string): Promise<Label[]> {
    await this.initDB();
    const userLabels = await this.db!.get('userLabels', userId);
    return userLabels?.labels || [];
  }

  async saveUserNotes(userId: string, notes: Note[]): Promise<void> {
    await this.initDB();
    await this.db!.put('userNotes', { userId, notes });
  }

  async saveUserLabels(userId: string, labels: Label[]): Promise<void> {
    await this.initDB();
    await this.db!.put('userLabels', { userId, labels });
  }

  async getUserSettings(userId: string): Promise<userData> {
    await this.initDB();
    const userSettings = await this.db!.get('userSettings', userId);
    return userSettings || { userId, noteIds: [], labelIds: [], darkMode: false };
  }

  async saveUserSettings(userId: string, settings: Omit<userData, 'userId'>): Promise<void> {
    await this.initDB();
    await this.db!.put('userSettings', { userId, ...settings });
  }
  


}


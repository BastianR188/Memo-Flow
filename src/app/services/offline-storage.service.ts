import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note } from '../model/note';

interface MyDB extends DBSchema {
  userNotes: {
    key: string;
    value: {
      userId: string;
      notes: Note[];
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
      this.db = await openDB<MyDB>('NotesApp', 2, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (!db.objectStoreNames.contains('userNotes')) {
            db.createObjectStore('userNotes', { keyPath: 'userId' });
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

  async saveUserNotes(userId: string, notes: Note[]): Promise<void> {
    await this.initDB();
    await this.db!.put('userNotes', { userId, notes });
  }
}

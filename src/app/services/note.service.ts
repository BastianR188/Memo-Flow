import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NoteService {

  // CRUD-Operationen für Notizen und Checklisten
  // Synchronisation mit Firebase

  constructor(private datePipe: DatePipe) {}

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

  submit(title: string, note: string, isChecklist: boolean, checklistItems: { text: string, checked: boolean }[], color: string, isPinned: boolean, attachments: File[]) {
    const id = this.newId();
    const type = isChecklist ? 'Checkliste' : 'Notiz';
    const currentDate = this.getCurrentDate();
    const formattedDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm:ss');

    console.log('Wurde bestätigt!');
    console.log('Title: ' + title);
    console.log('Type: ' + type);
    if (isChecklist) {
      console.log('Checklist Items: ' + JSON.stringify(checklistItems));
    } else {
      console.log('Note: ' + note);
    }
    console.log('CreatedAt: ' + formattedDate);
    console.log('Id: ' + id);
    console.log('Color: ' + color);
    console.log('Pinned: ' + isPinned);
    console.log('Attachments: ' + attachments.map(file => file.name).join(', '));
  }
}

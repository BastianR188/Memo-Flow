import { inject, Injectable } from '@angular/core';
import { collection, doc, DocumentData, documentId, Firestore, getDoc, getDocFromCache, getDocs, query, setDoc, Timestamp, where } from '@angular/fire/firestore';
import { FirebaseAttachment, ImageAttachment, Label, Note, userData } from '../model/note';
import { NoteService } from './note.service';
import { LabelService } from './label.service';
import { getStorage, ref } from "firebase/storage";
import { getDownloadURL, uploadBytes } from '@angular/fire/storage';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);
  isLoading: boolean = false;
  constructor(private noteService: NoteService,private labelService: LabelService) { }

  async getData(col: string) {
    const q = query(collection(this.firestore, col));
    let dataList: any[] = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      dataList.push(doc.data());
    });
    return dataList;
  }

  async saveUserData(id: string) {
    const userDocRef = doc(this.firestore, "userId", id);
    const notesCollectionRef = collection(this.firestore, "notes");
    const labelsCollectionRef = collection(this.firestore, "labels");

    try {
      // Benutzer-IDs speichern
      let userData = this.noteService.getAlId();
      await setDoc(userDocRef, userData);

      // Notes speichern
      const notesPromises = this.noteService.notes.map(async (note) => {
        const noteToSave = { ...note };
        noteToSave.attachments = await this.processAttachmentsToFirebase(note.attachments, id);
        await setDoc(doc(notesCollectionRef, note.id), noteToSave);
      });

      // Labels speichern
      const labelsPromises = this.labelService.labels.map(async (label) => {
        const labelDocRef = doc(labelsCollectionRef, label.id);
        await setDoc(labelDocRef, label);
      });

      // Warten, bis alle Notes und Labels gespeichert sind
      await Promise.all([...notesPromises, ...labelsPromises]);
    } catch (e) {
      console.error("Error saving data:", e);
    }
  }

  private async processAttachmentsToFirebase(attachments: ImageAttachment[], userId: string): Promise<FirebaseAttachment[]> {
    return Promise.all(attachments.map(async (attachment) => {
      if (attachment.url.startsWith('data:')) {
        // Es ist ein neues Attachment, das hochgeladen werden muss
        const path = `attachments/${userId}/${attachment.id}`;
        const storage = getStorage();
        const storageRef = ref(storage, path);
        
        // Konvertiere base64 zu Blob
        const response = await fetch(attachment.url);
        const blob = await response.blob();
        
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        
        return {
          id: attachment.id,
          name: attachment.name,
          url: downloadUrl,
          size: attachment.size
        };
      } else {
        // Es ist ein bereits hochgeladenes Attachment
        return attachment as FirebaseAttachment;
      }
    }));
  }

  async getUserDataAndRelatedItems(userId: string) {
    try {
      // 1. Benutzerdaten abrufen
      const userDocRef = doc(this.firestore, "userId", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.log("Keine Benutzerdaten gefunden!");
        return null;
      }

      const userData = userDocSnap.data() as userData;
      // 2. Notizen abrufen
      const notes: Note[] = await this.getNotesByIds(userData.noteIds, "notes");

      // 3. Labels abrufen
      const labels: Label[] = await this.getLabelsByIds(userData.labelIds, "labels");
      return {
        userData,
        notes,
        labels
      };

    } catch (error) {
      console.error("Fehler beim Abrufen der Daten:", error);
      return null;
    }
  }

  async setNote(note:any) {
    const setNote: Note = {
      id: note.id,
      title: note.title,
      content: note.content,
      isChecklist: note.isChecklist,
      checklistItems: note.checklistItems,
      color: note.color,
      isPinned: note.isPinned,
      attachments: await this.processAttachments(note.attachments),
      createdAt: this.formatTimestamp(note.createdAt),
      editAt: this.formatTimestamp(note.editAt),
      delete: note.delete,
      labels: note.labels,
      order: note.order
    };
    return setNote;
  }

  private async processAttachments(attachments: any[]): Promise<ImageAttachment[]> {
    if (!attachments) return [];
  
    return Promise.all(attachments.map(async (attachment) => {
      if (typeof attachment.url === 'string' && !attachment.url.startsWith('data:')) {
        // Dies ist eine Firebase Storage URL, wir müssen sie nicht ändern
        return attachment as ImageAttachment;
      } else {
        // Hier können Sie zusätzliche Logik hinzufügen, falls nötig
        return attachment as ImageAttachment;
      }
    }));
  }
  private formatTimestamp(timestamp: Timestamp | undefined): Date {
    if (!timestamp || !(timestamp instanceof Timestamp)) {
      return new Date();
    }
    
    return timestamp.toDate();
  }
  
  setLabel(label:any) {
    const setLabel: Label = {
      id: label.id,
      name: label.name,
      color: label.color
    };
    return setLabel
  }

  private async getNotesByIds(ids: string[], col: string): Promise<Note[]> {
    if (!ids || ids.length === 0) return [];
  
    const docRef = collection(this.firestore, col);
    const q = query(docRef, where(documentId(), 'in', ids));
  
    const querySnapshot = await getDocs(q);
    return Promise.all(querySnapshot.docs.map(async doc => {
      const data = doc.data();
      return await this.setNote(data);
    }));
  }

  private async getLabelsByIds(ids: string[], col: string): Promise<Label[]> {
    if (!ids || ids.length === 0) return [];
  
    const docRef = collection(this.firestore, col);
    const q = query(docRef, where(documentId(), 'in', ids));
  
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return this.setLabel(data);
    });
  }
  
}

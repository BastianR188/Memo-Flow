import { Injectable } from '@angular/core';
import { ImageAttachment } from '../model/note';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  
  constructor() { }

  async handleFileSelection(files: FileList): Promise<ImageAttachment[]> {
    const attachments: ImageAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const attachment = await this.createImageAttachment(file);
          attachments.push(attachment);
        } catch (error) {
          console.error('Error processing file:', file.name, error);
        }
      }
    }
    
    return attachments;
  }

  private createImageAttachment(file: File): Promise<ImageAttachment> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        resolve({
          name: file.name,
          url: e.target.result,
          size: file.size
        });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

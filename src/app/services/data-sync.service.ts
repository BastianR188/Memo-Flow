import { Injectable } from '@angular/core';
import { Note } from '../model/note';

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {

  constructor() { }

  

  
  mergeAndUpdateItems<T extends { id: string }>(currentItems: T[], newItems: T[]): T[] {
    const mergedItems = [...currentItems];
    
    newItems.forEach(newItem => {
      const index = mergedItems.findIndex(item => item.id === newItem.id);
      if (index !== -1) {
        // Wenn das Item bereits existiert, ersetzen wir es
        mergedItems[index] = newItem;
      } else {
        // Wenn das Item noch nicht existiert, fügen wir es hinzu
        mergedItems.push(newItem);
      }
    });
  
    return mergedItems;
  }
  
}

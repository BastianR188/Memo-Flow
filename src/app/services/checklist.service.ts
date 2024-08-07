import { Injectable } from '@angular/core';
import { ChecklistItem, Note } from '../model/note';

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  constructor() { }

  addChecklistItem(note: Note): void {
    const newItem: ChecklistItem = {
      text: '',
      checked: false,
      order: note.checklistItems.length
    };
    note.checklistItems.push(newItem);
    this.updateNoteChecklistItems(note);
  }

  removeChecklistItem(note: Note, index: number): void {
    note.checklistItems.splice(index, 1);
    this.updateNoteChecklistItems(note);
  }

  toggleChecklistItem(note: Note, index: number, isChecked: boolean): void {
    note.checklistItems[index].checked = isChecked;
    this.updateNoteChecklistItems(note);
  }

  updateNoteChecklistItems(note: Note): void {
    const uncheckedItems = note.checklistItems.filter(item => !item.checked);
    const checkedItems = note.checklistItems.filter(item => item.checked);
    note.checklistItems = [...uncheckedItems, ...checkedItems];
    note.checklistItems.forEach((item, index) => {
      item.order = index;
    });
  }

  getUncheckedItems(note: Note): ChecklistItem[] {
    return note.checklistItems.filter(item => !item.checked);
  }

  getCheckedItems(note: Note): ChecklistItem[] {
    return note.checklistItems.filter(item => item.checked);
  }

  reorderChecklistItems(note: Note, previousIndex: number, currentIndex: number, isCheckedList: boolean): void {
    const list = isCheckedList ? this.getCheckedItems(note) : this.getUncheckedItems(note);
    const [reorderedItem] = list.splice(previousIndex, 1);
    list.splice(currentIndex, 0, reorderedItem);
    this.updateNoteChecklistItems(note);
  }
}

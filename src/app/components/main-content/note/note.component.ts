import { Component, Input, OnInit } from '@angular/core';
import { ChecklistItem, Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent implements OnInit {
  @Input() note!: Note;
  uncheckedItems: ChecklistItem[] = [];
  checkedItems: ChecklistItem[] = [];
  isCompletedItemsVisible: boolean = true;

  ngOnInit() {
    this.sortChecklistItems();
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, isCheckedList: boolean) {
    const list = isCheckedList ? this.checkedItems : this.uncheckedItems;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.updateNoteChecklistItems();
    this.saveNote();
  }

  onCheckboxChange(index: number, isCheckedList: boolean) {
    const sourceList = isCheckedList ? this.checkedItems : this.uncheckedItems;
    const targetList = isCheckedList ? this.uncheckedItems : this.checkedItems;
    const [movedItem] = sourceList.splice(index, 1);
    targetList.push(movedItem);
    this.updateNoteChecklistItems();
    this.saveNote();
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  private sortChecklistItems() {
    this.uncheckedItems = this.note.checklistItems.filter(item => !item.checked);
    this.checkedItems = this.note.checklistItems.filter(item => item.checked);
  }

  private updateNoteChecklistItems() {
    this.note.checklistItems = [...this.uncheckedItems, ...this.checkedItems];
    this.note.checklistItems.forEach((item, index) => {
      item.order = index;
    });
  }

  private saveNote() {
    console.log('Es muss noch im Firebase gespeichert werden!')
    // this.noteService.updateNote(this.note);
  }
}

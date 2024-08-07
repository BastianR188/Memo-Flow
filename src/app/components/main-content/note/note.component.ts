import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChecklistItem, Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent implements OnInit {
  @Input() note!: Note;
  @Output() pinStatusChanged = new EventEmitter<void>();
  isCompletedItemsVisible: boolean = true;
  isEditing: boolean = false;

  constructor(private noteService: NoteService) { }

  ngOnInit() {
  }
  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
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

  togglePinNote() {
    this.note.isPinned = !this.note.isPinned;
    this.saveNote();
    this.pinStatusChanged.emit();
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  editNote() {
    this.isEditing = true;
  }
  addChecklistItem() {
    const newItem: ChecklistItem = {
      text: '',
      checked: false,
      order: this.note.checklistItems.length // Setzt die Reihenfolge auf die aktuelle Länge der Liste
    };
    this.note.checklistItems.push(newItem);
    this.updateNoteChecklistItems(); // Aktualisiere die Checklisten-Elemente nach dem Hinzufügen
  }

  removeChecklistItem(index: number) {
    this.note.checklistItems.splice(index, 1);
    this.updateNoteChecklistItems(); // Aktualisiere die Checklisten-Elemente nach dem Entfernen
  }

  private updateNoteChecklistItems() {
    this.note.checklistItems = [...this.uncheckedItems, ...this.checkedItems];
    this.note.checklistItems.forEach((item, index) => {
      item.order = index;
    });
  }

  changeColor(color: string) {
    this.note.color = color;
    this.saveNote();
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      Array.from(fileList).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.note.attachments.push(file.name);
        }
      });
      this.saveNote();
    }
  }

  removeAttachment(index: number) {
    this.note.attachments.splice(index, 1);
    this.saveNote();
  }

  saveNote() {
    this.updateNoteChecklistItems(); // Aktualisiere die Checklisten-Elemente vor dem Speichern
    this.noteService.updateNote(this.note);
    this.isEditing = false;
    this.pinStatusChanged.emit();
  }
}

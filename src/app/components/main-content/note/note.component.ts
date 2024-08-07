import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ChecklistItem, ImageAttachment, Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { AttachmentService } from '../../../services/attachment.service';
import { NoteService } from '../../../services/note.service';
import { ChecklistService } from '../../../services/checklist.service';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.scss'
})
export class NoteComponent {
  @Input() note!: Note;
  @Output() pinStatusChanged = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isCompletedItemsVisible: boolean = true;
  isEditing: boolean = false;
  attachments: ImageAttachment[] = [];

  constructor(
    private noteService: NoteService,
    private attachmentService: AttachmentService,
    private checklistService: ChecklistService
  ) { }

  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, isCheckedList: boolean) {
    this.checklistService.reorderChecklistItems(this.note, event.previousIndex, event.currentIndex, isCheckedList);
    this.saveNote();
  }

  onCheckboxChange(index: number, isCheckedList: boolean) {
    const item = isCheckedList ? this.checkedItems[index] : this.uncheckedItems[index];
    this.checklistService.toggleChecklistItem(this.note, this.note.checklistItems.indexOf(item), !item.checked);
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
    this.checklistService.addChecklistItem(this.note);
    this.saveNote();
  }

  removeChecklistItem(index: number) {
    this.checklistService.removeChecklistItem(this.note, index);
    this.saveNote();
  }

  changeColor(color: string) {
    this.note.color = color;
    this.saveNote();
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      const newAttachments = await this.attachmentService.handleFileSelection(fileList);
      this.note.attachments.push(...newAttachments);
      this.saveNote();

      // Zurücksetzen des Datei-Eingabefelds
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  removeAttachment(index: number) {
    this.note.attachments.splice(index, 1);
    this.saveNote();
  }

  async saveNote() {
    await this.noteService.updateNote(this.note);
    this.isEditing = false;
    this.pinStatusChanged.emit();
  }


}

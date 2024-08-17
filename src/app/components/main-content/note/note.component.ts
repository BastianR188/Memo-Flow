import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ChecklistItem, ImageAttachment, Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { AttachmentService } from '../../../services/attachment.service';
import { NoteService } from '../../../services/note.service';
import { ColorService } from '../../../services/color.service';
import { EditingNoteComponent } from "../editing-note/editing-note.component";
import { MatMenuModule } from '@angular/material/menu';
import { ClickOutsideDirective } from '../../../services/click-outside.directive';
import { ChecklistService } from '../../../services/checklist.service';
import { AutosizeModule } from 'ngx-autosize';
@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule, EditingNoteComponent, MatMenuModule, ClickOutsideDirective, AutosizeModule],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {
  @Input() note!: Note;
  @Output() pinStatusChanged = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isFullscreen: boolean = false;
  selectedColor: string = 'white'; // Standardfarbe, falls gewünscht
  isDropdownOpen: boolean = false;
  isCompletedItemsVisible: boolean = true;
  isEditing: boolean = false;
  attachments: ImageAttachment[] = [];
  colors: { name: string, value: string }[] = []; // Array für die Farben

  constructor(
    public noteService: NoteService,
    private attachmentService: AttachmentService,
    private colorService: ColorService,
    private checklistService: ChecklistService
  ) { }

  ngOnInit() {
    this.colors = this.colorService.getColors(); // Lade die Farben
    this.sortOrder()
  }

  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, isCheckedList: boolean) {
    const itemList = isCheckedList ? this.checkedItems : this.uncheckedItems;
    this.setOrder(itemList, event);
    this.updateChecklistOrder();
  }
  private setOrder(itemList: ChecklistItem[], event: CdkDragDrop<ChecklistItem[], ChecklistItem[], any>) {
    moveItemInArray(itemList, event.previousIndex, event.currentIndex);
    itemList.forEach((item, index) => {
      item.order = index;
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.color-selector')) {
      this.isDropdownOpen = false;
    }
  }

  selectColor(color: string) {
    this.note.color = color;
    this.isDropdownOpen = false;
  }
  updateChecklistOrder() {
    // Sortiere die gesamte Checkliste basierend auf der `order`-Eigenschaft
    this.note.checklistItems.sort((a, b) => a.order - b.order);
  }

  onCheckboxChange(event:any, itemId: string) {
    event.stopPropagation();

    const item = this.note.checklistItems.find(i => i.id === itemId);
    if (item) {
      this.sortOrder()
      if (item.checked == false) {
        item.checked = true;
        item.order = 0;
      } else {
        item.checked = false;
        item.order = this.uncheckedItems.length;
      }
      this.updateChecklistOrder()
    }
  }

  sortOrder() {
    this.uncheckedItems.forEach((item, index) => {
      item.order = index;
    });
    this.checkedItems.forEach((item, index) => {
      item.order = index + 1;
    })
  }

  togglePinNote() {
    this.note.isPinned = !this.note.isPinned;
    // this.pinStatusChanged.emit();
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  editNote() {
    this.isEditing = true;
    this.isFullscreen = true;
  }

  abortEditNote() {
    this.isEditing = false;
    this.isFullscreen = false;
    this.checkIfEmpty();

  }

  async saveNote() {
    await this.noteService.updateNote(this.note);
    // this.pinStatusChanged.emit();
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      await this.attachmentService.addAttachmentsToNote(this.note, fileList);
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  removeAttachment(event:any, attachmentId: string) {
    event.stopPropagation();
    this.attachmentService.removeAttachmentFromNote(this.note, attachmentId);
    this.checkIfEmpty()
  }

  checkIfEmpty() {
    if (this.note.attachments.length == 0 && this.note.title.length == 0 && this.note.content.length == 0 && this.note.checklistItems.length == 0) {
      this.deleteNote();
    }
  }

  deleteNote() {
    this.note.editAt = new Date();
    this.noteService.moveToTrash(this.note);
  }

  addChecklistItem() {
    const newItem: ChecklistItem = {
      id: this.checklistService.generateUniqueId(),
      text: '',
      checked: false,
      order: this.note.checklistItems.length
    };
    this.note.checklistItems.push(newItem);
    setTimeout(() => {
      this.focusNewItem(newItem.id);
    });
  }
  focusNewItem(id: string): void {
    setTimeout(() => {
      const newItem = document.getElementById(`item-${id}`);
      if (newItem) {
        (newItem as HTMLTextAreaElement).focus();
      }
    });
  }
  removeChecklistItem(itemId: string) {
    const index = this.note.checklistItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.note.checklistItems.splice(index, 1);
    }
  }
}

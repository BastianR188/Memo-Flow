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
@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule, EditingNoteComponent, MatMenuModule],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {
  @Input() note!: Note;
  @Output() pinStatusChanged = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedColor: string = 'white'; // Standardfarbe, falls gewünscht
  isDropdownOpen: boolean = false;
  editedNote: Note | null = null;
  isCompletedItemsVisible: boolean = true;
  isEditing: boolean = false;
  attachments: ImageAttachment[] = [];
  colors: { name: string, value: string }[] = []; // Array für die Farben

  constructor(
    public noteService: NoteService,
    private attachmentService: AttachmentService,
    private colorService: ColorService // Injektion des ColorService,
  ) { }

  ngOnInit() {
    this.colors = this.colorService.getColors(); // Lade die Farben
  }

  get uncheckedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => !item.checked);
  }

  get checkedItems(): ChecklistItem[] {
    return this.note.checklistItems.filter(item => item.checked);
  }

  onDrop(event: CdkDragDrop<ChecklistItem[]>, isCheckedList: boolean) {
    const itemList = isCheckedList ? this.checkedItems : this.uncheckedItems;
    moveItemInArray(itemList, event.previousIndex, event.currentIndex);
    itemList.forEach((item, index) => {
      item.order = index;
    });
    this.updateChecklistOrder();
  }
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  @HostListener('document:click', ['$event'])
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

  onCheckboxChange(itemId: string) {
    const item = this.note.checklistItems.find(i => i.id === itemId);
    if (item) {
      this.updateChecklistOrder();
    }
  }

  togglePinNote() {
    this.note.isPinned = !this.note.isPinned;
    this.pinStatusChanged.emit();
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  editNote() {
    this.editedNote = { ...this.note };
    this.isEditing = true;
    console.log('Dieser Note wird editiert:', this.editedNote)
  }

  abortEditNote() {
    this.isEditing = false;
    this.editedNote = null;
  }

  async saveNote() {
    if (this.editedNote) {
      this.note = { ...this.editedNote };
    }
    this.isEditing = false;
    await this.noteService.updateNote(this.note);
    this.pinStatusChanged.emit();
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

  removeAttachment(attachmentId: string) {
    this.attachmentService.removeAttachmentFromNote(this.note, attachmentId);
  }



  deleteNote() {
    this.note.editAt = new Date();
    this.noteService.moveToTrash(this.note);
  }
}

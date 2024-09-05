import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ChecklistItem, ImageAttachment, Label, Note } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { AttachmentService } from '../../../services/attachment.service';
import { NoteService } from '../../../services/note.service';
import { ColorService } from '../../../services/color.service';
import { MatMenuModule } from '@angular/material/menu';
import { ClickOutsideDirective } from '../../../services/click-outside.directive';
import { ChecklistService } from '../../../services/checklist.service';
import { AutosizeModule } from 'ngx-autosize';
import { LabelService } from '../../../services/label.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { TextFieldModule } from '@angular/cdk/text-field';
@Component({
  selector: 'app-note',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, FormsModule, MatMenuModule, ClickOutsideDirective, AutosizeModule,TextFieldModule],
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit, OnDestroy {
  @Input() note!: Note;
  @Output() pinStatusChanged = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  private labelSubscription!: Subscription;
  isFullscreen: boolean = false;
  isDropdownColorOpen: boolean = false;
  isDropdownMenuOpen: boolean = false;
  isDropdownLabelOpen: boolean = false;
  isCompletedItemsVisible: boolean = true;
  isEditing: boolean = false;
  attachments: ImageAttachment[] = [];
  colors: { name: string, value: string }[] = []; // Array für die Farben
  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;

  constructor(
    public noteService: NoteService,
    private attachmentService: AttachmentService,
    public colorService: ColorService,
    private checklistService: ChecklistService,
    public labelService: LabelService,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.subscriptionDarkMode = this.settingsService.darkMode$.subscribe(
      darkMode => this.darkMode = darkMode
    );
    this.sortOrder();
  }

  ngOnDestroy() {
    this.subscriptionDarkMode.unsubscribe();
    if (this.labelSubscription) {
      this.labelSubscription.unsubscribe();
    }
  }
  newNote() {
    const newNote: Note = {
      id: this.noteService.newId(),
      title: this.note.title,
      content: this.note.isChecklist ? '' : this.note.content,
      isChecklist: this.note.isChecklist,
      checklistItems: this.note.isChecklist ? this.note.checklistItems : [],
      color: this.note.color,
      isPinned: this.note.isPinned,
      attachments: this.note.attachments.map(attachment => ({
        ...attachment,
        id: this.attachmentService.generateUniqueId()
      })),
      createdAt: new Date(),
      editAt: null,
      delete: false,
      labels: this.note.labels,
      order: 0, // Setze immer auf 0 für neue Notizen
      // ... andere Eigenschaften
    };

    // Verschiebe alle anderen Notizen um eine Position nach unten
    this.shiftNotesOrder(newNote.isPinned);

    // Füge die neue Notiz hinzu
    if (newNote.isPinned) {
      this.noteService.pinnedNotes.unshift(newNote);
    } else {
      this.noteService.unpinnedNotes.unshift(newNote);
    }

    // Aktualisiere alle Notizen
    this.noteService.updateOfflineAllNotes(this.noteService.userId, [...this.noteService.pinnedNotes, ...this.noteService.unpinnedNotes]);

    return newNote;
  }
  private shiftNotesOrder(isPinned: boolean) {
    const notesToShift = isPinned ? this.noteService.pinnedNotes : this.noteService.unpinnedNotes;
    notesToShift.forEach(note => {
      note.order += 1;
    });
  }
  copieNote(note: Note) {
    this.noteService.addNote(this.newNote());
  }
  checkColor(noteColor: string) {
    return this.colorService.getColor(noteColor, this.darkMode);
  }
  validateAndCleanLabels() {
    const validLabels = new Map(this.labelService.labels.map(label => [label.id, label]));

    this.note.labels = this.note.labels.map(noteLabel => {
      const validLabel = validLabels.get(noteLabel.id);
      if (validLabel) {
        // Aktualisiere den Namen, falls er sich geändert hat
        return { ...noteLabel, name: validLabel.name };
      }
      return null;
    }).filter((label): label is Label => label !== null);
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

  selectLabel(id: string) {
    this.noteService.setSelectedLabel(id);
  }

  openDropdown(dropdownId: string, trash: boolean) {
    if (!trash) {
      if (dropdownId === 'color') {
        this.isDropdownColorOpen = true;
      } else if (dropdownId === 'label') {
        this.isDropdownLabelOpen = true;
      } else if (dropdownId === 'menu' && this.isDropdownLabelOpen == false) {
        this.isDropdownMenuOpen = true;
      }
    }
  }

  onClickOutside(dropdownId: string) {
    setTimeout(() => {
      if (dropdownId === 'color') {
        this.isDropdownColorOpen = false;
      } else if (dropdownId === 'menu') {
        this.isDropdownMenuOpen = false;
      } else if (dropdownId === 'label') {
        this.isDropdownLabelOpen = false;
      }
    })
  }

  ifNoteInLabels(id: string): boolean {
    return this.note.labels.some(label => label.id === id);
  }

  selectColor(color: string) {
    this.note.color = color;
    this.isDropdownColorOpen = false;
  }

  updateChecklistOrder() {
    // Sortiere die gesamte Checkliste basierend auf der `order`-Eigenschaft
    this.note.checklistItems.sort((a, b) => a.order - b.order);
  }

  onCheckboxChange(event: any, itemId: string) {
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
    this.saveNote(true);
  }

  toggleCompletedItems() {
    this.isCompletedItemsVisible = !this.isCompletedItemsVisible;
  }

  editNote(trash: boolean) {
    if (!trash) {
      this.isEditing = true;
      this.isFullscreen = true;
    }
  }

  abortEditNote() {
    this.isEditing = false;
    this.isFullscreen = false;
    this.checkIfEmpty();

  }

  async saveNote(refresh: boolean) {
    await this.noteService.updateNote(this.note, refresh);
  }

  async onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      await this.attachmentService.addAttachmentsToNote(this.note, fileList);
      this.saveNote(false);
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  removeAttachment(event: any, attachmentId: string) {
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

  toggleLabel(id: string) {
    if (this.ifNoteInLabels(id)) {
      const index = this.note.labels.findIndex(label => label.id === id);
      if (index !== -1) {
        this.note.labels.splice(index, 1);
      }
    } else {
      const labelToAdd = this.labelService.labels.find(label => label.id === id);
      if (labelToAdd) {
        const labelExists = this.note.labels.some(label => label.id === id);
        if (!labelExists) {
          this.note.labels.push(labelToAdd);
        }
      }
    }
    this.saveNote(false);
  }
}

import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { AttachmentService } from '../../../services/attachment.service';
import { ChecklistService } from '../../../services/checklist.service';
import { Note, ChecklistItem, ImageAttachment, Label } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteComponent } from '../note/note.component';
import { ColorService } from '../../../services/color.service';
import { AutosizeModule } from 'ngx-autosize';
import { LabelService } from '../../../services/label.service';
import { ClickOutsideDirective } from '../../../services/click-outside.directive';
import { CdkDragDrop, CdkDragPreview, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule,TextFieldModule, NoteComponent, AutosizeModule, ClickOutsideDirective, DragDropModule, CdkDragPreview],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('textArea') textAreas!: QueryList<ElementRef>;
  selectedColor: string = '#ffffff'; // Standardfarbe, falls gewünscht
  isDropdownColorOpen: boolean = false;
  isDropdownLabelOpen: boolean = false;
  labels: Label[] = [];
  imageUrls: string[] = [];
  userId: string = '';
  title: string = '';
  note: string = '';
  isChecklist: boolean = false;
  isPinned: boolean = false;
  attachments: ImageAttachment[] = [];
  checklistItems: ChecklistItem[] = [];
  colors: { name: string, value: string }[] = []; // Array für die Farben
  pinnedNotes$!: Observable<Note[]>;
  unpinnedNotes$!: Observable<Note[]>;
  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;

  constructor(
    public noteService: NoteService,
    private attachmentService: AttachmentService,
    private checklistService: ChecklistService,
    public colorService: ColorService,
    public labelService: LabelService,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    if (!this.selectedColor) {
      this.selectedColor = this.colorService.getColor(this.selectedColor, this.darkMode); // oder eine andere Standardfarbe
    }
      this.pinnedNotes$ = this.noteService.filteredPinnedNotes$;
      this.unpinnedNotes$ = this.noteService.filteredUnpinnedNotes$;
      this.subscriptionDarkMode = this.settingsService.darkMode$.subscribe(
        darkMode => this.darkMode = darkMode
      );
  }
  ngOnDestroy() {
    this.subscriptionDarkMode.unsubscribe();

  }
  drop(event: CdkDragDrop<Note[]>, isPinned:boolean) {
    const itemList = isPinned ? this.noteService.pinnedNotes : this.noteService.unpinnedNotes;
    moveItemInArray(itemList, event.previousIndex, event.currentIndex);
    itemList.forEach((item, index) => {
      item.order = index;
    });
    this.noteService.updateOfflineAllNotes(this.noteService.userId, [...this.noteService.pinnedNotes, ...this.noteService.unpinnedNotes]);
  }
  async createNote() {
    const hasContent = this.isChecklist
      ? this.checklistItems.some(item => item.text.length > 0)
      : this.note.length > 0;
    const hasAttachment = this.attachments && this.attachments.length > 0;
    if (this.title.length === 0 && !hasContent && !hasAttachment) {
      return this.resetForm();
    }
    await this.noteService.addNote(this.newNote());
    this.resetForm();
  }

  newNote() {
    const newNote: Note = {
      id: this.noteService.newId(),
      title: this.title,
      content: this.isChecklist ? '' : this.note,
      isChecklist: this.isChecklist,
      checklistItems: this.isChecklist ? this.checklistItems : [],
      color: this.selectedColor,
      isPinned: this.isPinned,
      attachments: this.attachments,
      createdAt: new Date(),
      editAt: null,
      delete: false,
      labels: this.labels,
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
    this.noteService.updateOfflineAllNotes(this.userId, [...this.noteService.pinnedNotes, ...this.noteService.unpinnedNotes]);

    return newNote;
  }

  private shiftNotesOrder(isPinned: boolean) {
    const notesToShift = isPinned ? this.noteService.pinnedNotes : this.noteService.unpinnedNotes;
    notesToShift.forEach(note => {
      note.order += 1;
    });
  }

  openDropdown(dropdownId: string) {
    if (dropdownId === 'color') {
      this.isDropdownColorOpen = true;
    } else if (dropdownId === 'label') {
      this.isDropdownLabelOpen = true;
    }
  }

  onClickOutside(dropdownId: string) {
    setTimeout(() => {
      if (dropdownId === 'color') {
        this.isDropdownColorOpen = false;
      } else if (dropdownId === 'label') {
        this.isDropdownLabelOpen = false;
      }
    })

  }
  selectColor(color: string) {
    this.selectedColor = color;
    this.isDropdownColorOpen = false;
  }
  checkColor() {
      return this.colorService.getColor(this.selectedColor, this.darkMode);
  }

  resetForm() {
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.selectedColor = '#ffffff';
    this.attachments = [];
    this.checklistItems = [];
    this.imageUrls = [];
    this.labels = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  selectLabel(id: string) {
    this.noteService.setSelectedLabel(id);
  }
  isChecklistItem() {
    if (this.checklistItems.length === 0) {
      this.addChecklistItem();
    }
  }

  deleteChecklistItems() {
    this.checklistItems = [];
  }

  addChecklistItem() {
    const newItem: ChecklistItem = {
      id: this.checklistService.generateUniqueId(),
      text: '',
      checked: false,
      order: this.checklistItems.length
    };
    this.checklistItems.push(newItem);
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
    const index = this.checklistItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.checklistItems.splice(index, 1);
    }
  }

  async onFileSelected(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = input.files;
    if (fileList) {
      // Verarbeite die Dateien mit deinem Service und füge sie zur bestehenden Liste hinzu
      const newAttachments = await this.attachmentService.handleFileSelection(fileList);
      this.attachments = this.attachments.concat(newAttachments);

      // Lese die neuen Dateien als Daten-URLs ein und füge sie zur bestehenden Liste hinzu
      Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            this.imageUrls.push(result);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  ifNoteInLabels(id: string): boolean {
    return this.labels.some(label => label.id === id);
  }

  toggleLabel(id: string) {
    if (this.ifNoteInLabels(id)) {
      const index = this.labels.findIndex(label => label.id === id);
      if (index !== -1) {
        this.labels.splice(index, 1);
      }
    } else {
      const labelToAdd = this.labelService.labels.find(label => label.id === id);
      if (labelToAdd) {
        const labelExists = this.labels.some(label => label.id === id);
        if (!labelExists) {
          this.labels.push(labelToAdd);
        } else {
          console.log(`Label "${labelToAdd.name}" existiert bereits in dieser Note.`);
        }
      } else {
        console.log(`Label mit ID ${id} wurde nicht gefunden.`);
      }
    }

  }

  onDrop(event: CdkDragDrop<Note[]>, isPinned: boolean) {
    const itemList = isPinned ? this.noteService.pinnedNotes : this.noteService.unpinnedNotes;
    this.setOrder(itemList, event)  
    this.noteService.updateOfflineAllNotes(this.noteService.userId, [...this.noteService.pinnedNotes, ...this.noteService.unpinnedNotes]);
  }

  private setOrder(itemList: Note[], event: CdkDragDrop<Note[], Note[], any>){
    moveItemInArray(itemList, event.previousIndex, event.currentIndex);
    itemList.forEach((item, index) => {
      item.order = index;
    });
  }

  // Benutzerdefinierte Vorschau für die gezogene Notiz
  dragPreview(note: Note) {
    const previewElement = document.createElement('div');
    previewElement.classList.add('note-preview');
    previewElement.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content.substring(0, 50)}...</p>
    `;
    return previewElement;
  }
}

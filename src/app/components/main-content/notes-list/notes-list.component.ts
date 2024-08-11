import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { AttachmentService } from '../../../services/attachment.service';
import { ChecklistService } from '../../../services/checklist.service';
import { Note, ChecklistItem, ImageAttachment } from '../../../model/note';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoteComponent } from '../note/note.component';
import { ColorService } from '../../../services/color.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NoteComponent],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedColor: string = 'white'; // Standardfarbe, falls gewünscht
  isDropdownOpen: boolean = false;
  imageUrls: string[] = [];
  userId: string = '';
  title: string = '';
  note: string = '';
  isChecklist: boolean = false;
  isPinned: boolean = false;
  attachments: ImageAttachment[] = [];
  checklistItems: ChecklistItem[] = [];
  colors: { name: string, value: string }[] = []; // Array für die Farben
  constructor(
    public noteService: NoteService,
    private attachmentService: AttachmentService,
    private checklistService: ChecklistService,
    private colorService: ColorService // Injektion des ColorService
  ) { }

  ngOnInit() {
    this.colors = this.colorService.getColors();
  }

  async createNote() {
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
      delete: false
    };

    await this.noteService.addNote(newNote);
    this.resetForm();
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
    this.selectedColor = color;
    this.isDropdownOpen = false;
  }
  resetForm() {
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.selectedColor = '';
    this.attachments = [];
    this.checklistItems = [];
    this.imageUrls = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  addChecklistItem() {
    const newItem: ChecklistItem = {
      id: this.checklistService.generateUniqueId(),
      text: '',
      checked: false,
      order: this.checklistItems.length
    };
    this.checklistItems.push(newItem);
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


  onPinStatusChanged() {
  }


}

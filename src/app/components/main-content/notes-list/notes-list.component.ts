import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

  userId: string = '';
  title: string = '';
  note: string = '';
  isChecklist: boolean = false;
  isPinned: boolean = false;
  selectedColor: string = '';
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
      id: '',
      title: this.title,
      content: this.isChecklist ? '' : this.note,
      isChecklist: this.isChecklist,
      checklistItems: this.isChecklist ? this.checklistItems : [],
      color: this.selectedColor,
      isPinned: this.isPinned,
      attachments: this.attachments,
      createdAt: new Date(),
      editAt: new Date(),
      delete: false
    };

    await this.noteService.addNote(newNote);
    this.resetForm();
  }

  resetForm() {
    this.title = '';
    this.note = '';
    this.isChecklist = false;
    this.isPinned = false;
    this.selectedColor = '';
    this.attachments = [];
    this.checklistItems = [];
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
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.attachments = await this.attachmentService.handleFileSelection(fileList);
    }
  }

  onPinStatusChanged() {
  }


}

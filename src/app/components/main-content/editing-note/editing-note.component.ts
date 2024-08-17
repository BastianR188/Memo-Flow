import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Note } from '../../../model/note';
import { ChecklistService } from '../../../services/checklist.service';
import { AutosizeModule } from 'ngx-autosize';

@Component({
  selector: 'app-editing-note',
  standalone: true,
  imports: [CommonModule, FormsModule, AutosizeModule],
  templateUrl: './editing-note.component.html',
  styleUrls: ['./editing-note.component.scss']
})
export class EditingNoteComponent {
  @Input() note!: Note;
  @Output() save = new EventEmitter<Note>();
  @Output() cancel = new EventEmitter<void>();
  constructor(private checklistService: ChecklistService) { }
  saveNote() {
    this.save.emit(this.note);
  }

  abortEditNote() {
    this.cancel.emit();
  }

  addChecklistItem() {
    this.checklistService.addChecklistItem(this.note);
  }

  removeChecklistItem(itemId: string) {
    this.checklistService.removeChecklistItem(this.note, itemId);
  }
  
}

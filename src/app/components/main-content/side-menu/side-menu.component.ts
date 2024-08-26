import { Component } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { Router } from '@angular/router';
import { LabelService } from '../../../services/label.service';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../../services/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { Label } from '../../../model/note';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, FormsModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  labelDropdown: boolean = false;
  addLabelDropdown: boolean = false;
  inputLabel: string = '';
  isEditLabel: number = -1;
  editInputName: string = '';
  constructor(private noteService: NoteService, private router: Router, public label: LabelService) { }
  goToTrash() {
    this.noteService.openTrash = true;
  }

  goToNote() {
    this.noteService.openTrash = false;
  }

  goToLogin() {
    this.router.navigate(['']);
  }
  addNewLabel() {
    if (this.inputLabel.length != 0) {
      this.label.addLabel(this.inputLabel);
      this.inputLabel = '';
    }
  }
  openDropdown(dropdownId: string) {
    if (dropdownId === 'addLabel') {
      this.addLabelDropdown = true;
      this.labelDropdown = false;
    } else if (dropdownId === 'label') {
      this.labelDropdown = true;
      this.addLabelDropdown = false;
    }
  }

  onClickOutside(dropdownId: string) {
    if (dropdownId === 'addLabel') {
      this.addLabelDropdown = false;
    } else if (dropdownId === 'label') {
      this.labelDropdown = false;
    }
  }

  editLabel(label: Label, index: number) {
    this.editInputName = label.name
    this.isEditLabel = index;
  }

  setLabel(i: number) {
    this.label.labels[i].name = this.editInputName;
    this.isEditLabel = -1;
    this.editInputName = '';
    this.label.setLabel();
  }

  abortNewLabel() {
    this.inputLabel = '';
  }

  removeLabel(label: Label) {
    const index = this.label.labels.findIndex(item => item === label);
    if (index !== -1) {
      this.label.deletLabel(index);
    } else {
      console.log(`Label not found: ${label}`);
    }
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { Router } from '@angular/router';
import { LabelService } from '../../../services/label.service';
import { CommonModule } from '@angular/common';
import { ClickOutsideDirective } from '../../../services/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { Label } from '../../../model/note';
import { FirebaseService } from '../../../services/firebase.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, FormsModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  labelDropdown: boolean = false;
  addLabelDropdown: boolean = false;
  inputLabel: string = '';
  isEditLabel: number = -1;
  editInputName: string = '';
  darkMode: boolean = false;
  private subscriptionDarkMode!: Subscription;
  constructor(public noteService: NoteService, private router: Router, public firebaseService: FirebaseService, public label: LabelService, public settingsService: SettingsService) { }
  ngOnInit() {
    this.subscriptionDarkMode = this.settingsService.darkMode$.subscribe(
      darkMode => this.darkMode = darkMode
    );
    this.subscription = this.label.getLabels().subscribe(
      labels => this.label._labels = labels
    );
  }
  ngOnDestroy() {
    this.subscriptionDarkMode.unsubscribe();
    this.subscription.unsubscribe();
  }
  goToTrash() {
    this.noteService.clearSelectedLabel();
    this.noteService.openTrash = true;
    this.noteService.clearSearchTerm();
  }

  goToNote() {
    this.noteService.openTrash = false;
    this.noteService.clearSelectedLabel();
    this.noteService.clearSearchTerm();
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

  setLabel(label:Label, i: number) {
    this.label.labels[i].name = this.editInputName;
    this.isEditLabel = -1;
    this.editInputName = '';
    this.label.setLabel();
    this.noteService.updateLabelsInAllNotes(label, false);
  }

  abortNewLabel() {
    this.inputLabel = '';
  }

  selectLabel(id: string) {
    this.noteService.openTrash = false;
    this.noteService.setSelectedLabel(id);
    this.noteService.clearSearchTerm();
  }

  async removeLabel(label: Label) {
    const index = this.label.labels.findIndex(item => item === label);
    if (index !== -1) {
      const deletedLabel = await this.label.deletLabel(index);
      if (deletedLabel) {
        this.noteService.updateLabelsInAllNotes(deletedLabel, true);
      }
    } else {
      console.log(`Label not found: ${label}`);
    }
  }


}

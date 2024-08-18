import { Component } from '@angular/core';
import { NoteService } from '../../../services/note.service';
import { Router } from '@angular/router';
import { LabelService } from '../../../services/label.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  constructor(private noteService: NoteService, private router: Router, private label:LabelService) { }
  goToTrash() {
    this.noteService.openTrash = true;
  }

  goToNote() {
    this.noteService.openTrash = false;
  }

  goToLogin() {
    this.router.navigate(['']);
  }
  addLabel() {
    this.label.newLabel();
  }
}

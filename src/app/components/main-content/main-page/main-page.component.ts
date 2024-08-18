import { Component, OnInit } from '@angular/core';
import { NotesListComponent } from '../notes-list/notes-list.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../../services/note.service';
import { TrashComponent } from "../trash/trash.component";
import { CommonModule } from '@angular/common';
import { LabelService } from '../../../services/label.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NotesListComponent, SideMenuComponent, TrashComponent, CommonModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {

  constructor(
    private route: ActivatedRoute, public noteService: NoteService, private labelService: LabelService) { }
  ngOnInit() {
    this.route.params.subscribe(async params => {
      const userId = params['id'];
      await this.noteService.setUserId(userId);
      this.loadNotes();
      this.loadLabels();
    });
  }
  loadNotes() {
    this.noteService.getNotes().subscribe(notes => {
      this.noteService.sortNotes(notes);
    });
  }
  loadLabels() {
    this.labelService.getLabels().subscribe();
  }
}

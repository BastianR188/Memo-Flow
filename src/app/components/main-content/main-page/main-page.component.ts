import { Component, OnInit } from '@angular/core';
import { NotesListComponent } from '../notes-list/notes-list.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { ActivatedRoute } from '@angular/router';
import { NoteService } from '../../../services/note.service';
import { TrashComponent } from "../trash/trash.component";
import { CommonModule } from '@angular/common';
import { LabelService } from '../../../services/label.service';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NotesListComponent, SideMenuComponent, TrashComponent, CommonModule, HeaderMenuComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent implements OnInit {
  private destroy$ = new Subject<void>();
  constructor(
    private route: ActivatedRoute, public noteService: NoteService, private labelService: LabelService,
    private settingsService: SettingsService) {
  }
  ngOnInit() {
    this.route.params.pipe(
      switchMap(params => {
        const userId = params['id'];
        return this.initializeServices(userId);
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadNotes();
      this.loadLabels();
    });
  }
  private initializeServices(userId: string) {
    return Promise.all([
      this.noteService.setUserId(userId),
      this.labelService.setUserId(userId),
      this.settingsService.setUserId(userId)
    ]);
  }
  loadNotes() {
    this.noteService.getNotes().pipe(
      tap(notes => this.noteService.sortNotes(notes)),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  loadLabels() {
    this.labelService.getLabels().pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

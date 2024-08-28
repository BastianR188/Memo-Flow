import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NoteService } from '../../../services/note.service';
import { FirebaseService } from '../../../services/firebase.service';
import { LabelService } from '../../../services/label.service';
import { CommonModule } from '@angular/common';
import { combineLatest, distinctUntilChanged, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header-menu.component.html',
  styleUrl: './header-menu.component.scss'
})
export class HeaderMenuComponent implements OnInit, OnDestroy {
  title: string = 'Notizen';
  private subscription!: Subscription;
  searchTerm: string = '';
  private searchSubscription!: Subscription;
  constructor(private router: Router, private noteService: NoteService, public firebaseService: FirebaseService, private labelService: LabelService) { }
  ngOnInit() {
    this.searchSubscription = this.noteService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
    });
    this.subscription = combineLatest([
      this.noteService.selectedLabel$,
      this.noteService.openTrash$,
      this.labelService.labels$
    ]).pipe(
      distinctUntilChanged((prev, curr) =>
        prev[0] === curr[0] && prev[1] === curr[1] && prev[2].length === curr[2].length
      )
    ).subscribe(() => {
      this.change();
    });
  }
  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  change() {
    if (this.noteService.selectedLabel === '' && !this.noteService.openTrash) {
      this.title = 'Notizen';
    } else if (this.noteService.openTrash) {
      this.title = 'Papierkorb';
    } else {
      const labelTitle = this.labelService.labels.find(label => label.id === this.noteService.selectedLabel);
      if (labelTitle) {
        this.title = labelTitle.name;
      } else {
        this.title = 'Notizen';
      }
    }
  }
  clearSearchTerm() {
    this.searchTerm = '';
    this.noteService.setSearchTerm('');

  }
  onSearchChange(term: string) {
    this.noteService.setSearchTerm(term);
  }

  goToLogin() {
    this.router.navigate(['']);
    this.noteService.openTrash = false;
    this.noteService.clearSelectedLabel();
  }

  async loadFirebaseNotes() {
    this.firebaseService.isLoading = true;
    let data = await (this.firebaseService.getUserDataAndRelatedItems(this.noteService.userId))
    if (data?.notes) {
      await this.noteService.updateAllNotes(this.noteService.userId, data.notes)
    }
    if (data?.labels) {
      await this.labelService.updateAllLabels(this.noteService.userId, data.labels)
    }
    this.firebaseService.isLoading = false;
  }

  async saveFirebaseNotes() {
    this.firebaseService.isLoading = true;
    await this.firebaseService.saveUserData(this.noteService.userId);
    this.firebaseService.isLoading = false;
  }
}

import { Component } from '@angular/core';
import { NoteService } from '../../../services/note.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {
  constructor(private noteService: NoteService){}
  goToTrash(){
    this.noteService.openTrash = true;
  }

  goToNote(){
    this.noteService.openTrash = false;
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  private colors = [
    { name: 'Weiß', value: '' },
    { name: 'Rot', value: '#ffcccb' },
    { name: 'Grün', value: '#90ee90' },
    { name: 'Blau', value: '#add8e6' },
    { name: 'Gelb', value: '#ffffe0' }
  ];

  getColors() {
    return this.colors;
  }
}

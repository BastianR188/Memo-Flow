import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  selectedColor: string = 'white'; // Standardfarbe, falls gewünscht
  isDropdownOpen: boolean = false;
  constructor() { }

  private colors = [
    { name: 'Weiß', value: '#ffffff' },
    { name: 'Rot', value: '#ffcccb' },
    { name: 'Grün', value: '#90ee90' },
    { name: 'Blau', value: '#add8e6' },
    { name: 'Gelb', value: '#ffffe0' },
    { name: 'Orange', value: '#ffe4b5' }, // 1. Neue Farbe
    { name: 'Lila', value: '#e6e6fa' },   // 2. Neue Farbe
    { name: 'Rosa', value: '#ffb6c1' },   // 3. Neue Farbe
    { name: 'Braun', value: '#d2b48c' },   // 4. Neue Farbe
    { name: 'Grau', value: '#d3d3d3' },    // 5. Neue Farbe
    { name: 'Türkis', value: '#40e0d0' },   // 6. Neue Farbe
    { name: 'Beige', value: '#f5f5dc' },    // 7. Neue Farbe
    { name: 'Olive', value: '#808000' },    // 8. Neue Farbe
    { name: 'Indigo', value: '#4b0082' }    // 9. Neue Farbe
  ];


  getColors() {
    return this.colors;
  }

}

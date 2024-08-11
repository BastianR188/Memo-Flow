import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditingNoteComponent } from './editing-note.component';

describe('EditingNoteComponent', () => {
  let component: EditingNoteComponent;
  let fixture: ComponentFixture<EditingNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditingNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditingNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Label } from '../../../../model/note';

@Component({
  selector: 'app-dialog-label',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  templateUrl: './dialog-label.component.html',
  styleUrl: './dialog-label.component.scss'
})
export class DialogLabelComponent {
  labelName: string = '';
  errorMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogLabelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { labels: Label[] }
  ) { }

  onSubmit() {
    if (!this.labelName.trim()) {
      this.errorMessage = 'Labelname ist erforderlich';
      return;
    }

    const labelExists = this.data.labels.some(
      label => label.name.toLowerCase() === this.labelName.trim().toLowerCase()
    );

    if (labelExists) {
      this.errorMessage = 'Dieser Labelname existiert bereits!';
      return;
    }

    // Wenn alles in Ordnung ist, schließen Sie den Dialog mit dem neuen Label
    this.dialogRef.close(this.labelName.trim());
  }

  clearError() {
    this.errorMessage = '';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}


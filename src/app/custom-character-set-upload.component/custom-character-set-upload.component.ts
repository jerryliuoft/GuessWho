import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  CustomCharacterSetService,
  Character,
} from '../custom-character-set.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-character-set-upload',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onUpload()" class="upload-form">
      <h2 class="dialog-title">Upload Custom Character Set</h2>
      <div class="form-group">
        <label for="setName">Set Name</label>
        <input id="setName" formControlName="setName" required />
      </div>
      <div class="form-group">
        <label for="characterFiles">Characters</label>
        <input
          id="characterFiles"
          type="file"
          multiple
          (change)="onFilesSelected($event)"
          accept="image/*"
        />
      </div>
      <div class="character-list">
        @if (characters().length > 0) {
        <div class="character-list-title">Selected Characters:</div>
        @for (char of characters(); track char.name) {
        <div class="character-item">{{ char.name }}</div>
        } }
      </div>
      <div class="button-row">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="form.invalid || loading()"
        >
          Upload
        </button>
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
      </div>
      @if (loading()) {
      <div class="status-message">Uploading...</div>
      } @if (error()) {
      <div class="status-message error">{{ error() }}</div>
      }
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./custom-character-set-upload.component.scss'],
})
export class CustomCharacterSetUploadComponent {
  private fb = inject(FormBuilder);
  private service = inject(CustomCharacterSetService);
  private dialogRef = inject(MatDialogRef<CustomCharacterSetUploadComponent>);

  form = this.fb.group({
    setName: ['', Validators.required],
  });

  characters = signal<Character[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const chars = files.map((file) => ({
      name: file.name.replace(/\.[^/.]+$/, ''),
      imageFile: file,
    }));
    this.characters.set(chars);
  }

  async onUpload() {
    if (this.form.invalid || this.characters().length === 0) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.service.uploadCharacterSet(
        this.form.value.setName!,
        this.characters()
      );
      this.dialogRef.close(true);
    } catch (err) {
      // Print error to console for debugging
      console.error('Upload failed:', err);
      this.error.set('Upload failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}

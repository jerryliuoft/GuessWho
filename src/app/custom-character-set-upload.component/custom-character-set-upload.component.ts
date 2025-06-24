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

@Component({
  selector: 'app-custom-character-set-upload',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onUpload()" class="upload-form">
      <label>
        Set Name:
        <input formControlName="setName" required />
      </label>
      <label>
        Characters:
        <input
          type="file"
          multiple
          (change)="onFilesSelected($event)"
          accept="image/*"
        />
      </label>
      <div class="character-list">
        @for (char of characters(); track char.name) {
        <div>{{ char.name }}</div>
        }
      </div>
      <button type="submit" [disabled]="form.invalid || loading()">
        Upload
      </button>
      @if (loading()) {
      <div>Uploading...</div>
      } @if (error()) {
      <div>{{ error() }}</div>
      }
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      this.error.set('Upload failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}

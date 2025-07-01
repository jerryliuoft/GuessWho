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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-custom-character-set-upload',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ImageCropperComponent,
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onUpload()"
      class="upload-form fullscreen-upload-form"
    >
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
          #fileInput
          style="display: none;"
        />
        <button
          mat-raised-button
          color="accent"
          type="button"
          (click)="fileInput.click()"
        >
          Choose Files
        </button>
        <span class="file-count" *ngIf="cropStates().length > 0"
          >{{ cropStates().length }} file(s) selected</span
        >
      </div>
      <div class="character-list">
        @if (cropStates().length > 0) {
        <div class="character-list-title">Crop and Preview Characters:</div>
        <div class="crop-grid">
          @for (state of cropStates(); track state.id) {
            <div class="crop-grid-item">
              <image-cropper
                [imageBase64]="state.imageBase64"
                [maintainAspectRatio]="true"
                [aspectRatio]="1"
                format="png"
                [resizeToWidth]="512"
                [resizeToHeight]="512"
                (imageCropped)="onImageCropped(state.id, $event)"
                (imageLoaded)="onImageLoaded(state.id)"
                class="character-cropper"
              ></image-cropper>
              <mat-form-field appearance="outline" class="character-name-field">
                <input
                  matInput
                  type="text"
                  [value]="state.name"
                  (input)="onCharacterNameInput(state.id, $event)"
                  maxlength="32"
                  class="character-name-input"
                  placeholder="Character name"
                  autocomplete="off"
                  autocapitalize="words"
                  spellcheck="false"
                />
              </mat-form-field>
            </div>
          }
        </div>
        }
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
  cropStates = signal<{ id: string; name: string; imageBase64: string; croppedDataUrl: string | null }[]>([]);

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const states: { id: string; name: string; imageBase64: string; croppedDataUrl: string | null }[] = [];
    for (const file of files) {
      const imageBase64 = await this.fileToDataUrl(file);
      const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      states.push({
        id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageBase64,
        croppedDataUrl: null,
      });
    }
    this.cropStates.set(states);
  }

  onCharacterNameEdit(id: string, newName: string) {
    this.cropStates.update((states) =>
      states.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  }

  onCharacterNameInput(id: string, event: Event) {
    const value = (event.target as HTMLInputElement).value || '';
    this.onCharacterNameEdit(id, value);
  }

  onImageCropped(id: string, event: ImageCroppedEvent) {
    if (event.base64) {
      this.cropStates.update((states) =>
        states.map((s) =>
          s.id === id ? { ...s, croppedDataUrl: event.base64 ?? null } : s
        )
      );
    } else if (event.blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.cropStates.update((states) =>
          states.map((s) =>
            s.id === id ? { ...s, croppedDataUrl: (reader.result as string) ?? null } : s
          )
        );
      };
      reader.readAsDataURL(event.blob);
    } else {
      this.cropStates.update((states) =>
        states.map((s) =>
          s.id === id ? { ...s, croppedDataUrl: null } : s
        )
      );
    }
  }

  onImageLoaded(name: string) {
    // If no crop has been set yet, force the cropper to emit the cropped image
    // This is a no-op, as the cropper will emit imageCropped on load, but this is a placeholder for future logic if needed
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onUpload() {
    if (this.form.invalid || this.cropStates().length === 0) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const characters = this.cropStates()
        .filter((s) => s.croppedDataUrl)
        .map((s) => ({
          name: s.name,
          imageDataUrl: s.croppedDataUrl!,
        }));
      await this.service.uploadCharacterSet(
        this.form.value.setName!,
        characters
      );
      this.dialogRef.close(true);
    } catch (err) {
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

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// Removed MatDialogRef: not needed for routed component
import { CustomCharacterSetService } from '../custom-character-set.service';
import { Character } from '../models/character.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

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
    NgOptimizedImage,
  ],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onUpload()"
      class="upload-form fullscreen-upload-form"
    >
      <h2 class="dialog-title">Upload Custom Character Set</h2>
      <div class="mode-toggle">
        <button
          type="button"
          [class.selected]="mode() === 'upload'"
          (click)="mode.set('upload')"
        >
          Upload Images
        </button>
        <button
          type="button"
          [class.selected]="mode() === 'search'"
          (click)="mode.set('search')"
        >
          Search Anime Characters
        </button>
      </div>
      <div class="form-group">
        <label for="setName">Set Name</label>
        <input id="setName" formControlName="setName" required />
      </div>
      @if (mode() === 'upload') {
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
      } @if (mode() === 'search') {
      <div class="search-section">
        <label for="searchInput">Search Characters</label>
        <input
          id="searchInput"
          type="text"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          (keydown.enter)="onSearch()"
          placeholder="e.g. Naruto"
          autocomplete="off"
        />
        <button
          mat-raised-button
          color="accent"
          type="button"
          (click)="onSearch()"
          [disabled]="searching() || !searchQuery().trim()"
        >
          Search
        </button>
        @if (searching()) {
        <span class="search-status">Searching...</span>
        } @if (searchError()) {
        <span class="search-status error">{{ searchError() }}</span>
        }
        <div class="search-results">
          @for (char of searchResults(); track char.mal_id) {
          <div
            class="search-result-item"
            [class.selected]="isSelectedSearchResult(char.mal_id)"
            (click)="onSelectSearchResult(char)"
            tabindex="0"
            role="button"
            [attr.aria-pressed]="isSelectedSearchResult(char.mal_id)"
          >
            <img
              [ngSrc]="
                char.images.jpg?.image_url || char.images.webp?.image_url || ''
              "
              width="80"
              height="80"
              [attr.alt]="char.name"
              loading="lazy"
            />
            <div class="search-result-name">{{ char.name }}</div>
          </div>
          }
        </div>
      </div>
      <div class="character-list">
        @if (searchCropStates().length > 0) {
        <div class="character-list-title">Crop and Preview Characters:</div>
        <div class="crop-grid">
          @for (state of searchCropStates(); track state.id) {
          <div class="crop-grid-item">
            <image-cropper
              [imageBase64]="state.imageBase64"
              [maintainAspectRatio]="true"
              [aspectRatio]="1"
              format="png"
              [resizeToWidth]="512"
              [resizeToHeight]="512"
              (imageCropped)="onImageCropped(state.id, $event, true)"
              (imageLoaded)="onImageLoaded(state.id)"
              class="character-cropper"
            ></image-cropper>
            <mat-form-field appearance="outline" class="character-name-field">
              <input
                matInput
                type="text"
                [value]="state.name"
                (input)="onCharacterNameInput(state.id, $event, true)"
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
      }
      <div class="button-row">
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="
            form.invalid ||
            loading() ||
            (mode() === 'upload' && cropStates().length === 0) ||
            (mode() === 'search' && searchCropStates().length === 0)
          "
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
  private router = inject(Router);

  form = this.fb.group({
    setName: ['', Validators.required],
  });

  mode = signal<'upload' | 'search'>('upload');

  characters = signal<Character[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Upload mode state
  cropStates = signal<
    {
      id: string;
      name: string;
      imageBase64: string;
      croppedDataUrl: string | null;
    }[]
  >([]);

  // Search mode state
  searchQuery = signal('');
  searching = signal(false);
  searchError = signal<string | null>(null);
  searchResults = signal<JikanCharacterResult[]>([]);
  searchCropStates = signal<
    {
      id: string;
      name: string;
      imageBase64: string;
      croppedDataUrl: string | null;
      mal_id: number;
    }[]
  >([]);

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const states: {
      id: string;
      name: string;
      imageBase64: string;
      croppedDataUrl: string | null;
    }[] = [];
    for (const file of files) {
      const imageBase64 = await this.fileToDataUrl(file);
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      states.push({
        id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageBase64,
        croppedDataUrl: null,
      });
    }
    this.cropStates.set(states);
  }

  onCharacterNameEdit(id: string, newName: string, searchMode = false) {
    if (searchMode) {
      this.searchCropStates.update((states) =>
        states.map((s) => (s.id === id ? { ...s, name: newName } : s))
      );
    } else {
      this.cropStates.update((states) =>
        states.map((s) => (s.id === id ? { ...s, name: newName } : s))
      );
    }
  }

  onCharacterNameInput(id: string, event: Event, searchMode = false) {
    const value = (event.target as HTMLInputElement).value || '';
    this.onCharacterNameEdit(id, value, searchMode);
  }

  onImageCropped(id: string, event: ImageCroppedEvent, searchMode = false) {
    if (event.base64) {
      const updateFn = (states: any[]) =>
        states.map((s) =>
          s.id === id ? { ...s, croppedDataUrl: event.base64 ?? null } : s
        );
      if (searchMode) {
        this.searchCropStates.update(updateFn);
      } else {
        this.cropStates.update(updateFn);
      }
    } else if (event.blob) {
      const reader = new FileReader();
      reader.onload = () => {
        const updateFn = (states: any[]) =>
          states.map((s) =>
            s.id === id
              ? { ...s, croppedDataUrl: (reader.result as string) ?? null }
              : s
          );
        if (searchMode) {
          this.searchCropStates.update(updateFn);
        } else {
          this.cropStates.update(updateFn);
        }
      };
      reader.readAsDataURL(event.blob);
    } else {
      const updateFn = (states: any[]) =>
        states.map((s) => (s.id === id ? { ...s, croppedDataUrl: null } : s));
      if (searchMode) {
        this.searchCropStates.update(updateFn);
      } else {
        this.cropStates.update(updateFn);
      }
    }
  }

  onImageLoaded(_id: string) {
    // Placeholder for future logic if needed
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- Search Mode Logic ---

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  async onSearch() {
    const query = this.searchQuery().trim();
    if (!query) return;
    this.searching.set(true);
    this.searchError.set(null);
    try {
      // Use fetch to call Jikan REST API directly
      const res = await fetch(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(
          query
        )}&limit=10`
      );
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      this.searchResults.set(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error('Jikan API search error:', err);
      this.searchError.set('Failed to fetch characters');
      this.searchResults.set([]);
    } finally {
      this.searching.set(false);
    }
  }

  isSelectedSearchResult(mal_id: number): boolean {
    return this.searchCropStates().some((s) => s.mal_id === mal_id);
  }

  async onSelectSearchResult(char: any) {
    if (this.isSelectedSearchResult(char.mal_id)) return;
    // Get the best available image
    const imageUrl =
      char.images?.jpg?.image_url || char.images?.webp?.image_url || '';
    if (!imageUrl) return;
    const imageBase64 = await this.fetchImageAsBase64(imageUrl);
    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    this.searchCropStates.update((states) => [
      ...states,
      {
        id,
        name: char.name,
        imageBase64,
        croppedDataUrl: null,
        mal_id: char.mal_id,
      },
    ]);
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return await this.fileToDataUrl(
      new File([blob], 'character.png', { type: blob.type })
    );
  }

  async onUpload() {
    if (this.form.invalid) return;
    const states =
      this.mode() === 'upload' ? this.cropStates() : this.searchCropStates();
    if (states.length === 0) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const characters: Character[] = states
        .filter((s) => s.croppedDataUrl)
        .map((s) => ({
          name: s.name,
          imageUrl: s.croppedDataUrl!,
        }));
      await this.service.uploadCharacterSet(
        this.form.value.setName!,
        characters
      );
      this.router.navigateByUrl('/');
    } catch (err) {
      console.error('Upload failed:', err);
      this.error.set('Upload failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.router.navigateByUrl('/');
  }
}

// Jikan character result type
declare interface JikanCharacterResult {
  mal_id: number;
  name: string;
  images: {
    jpg?: { image_url?: string };
    webp?: { image_url?: string };
  };
}

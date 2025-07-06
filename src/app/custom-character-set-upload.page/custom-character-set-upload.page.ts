import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Third-party and App-specific Imports
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { CustomCharacterSetService } from '../custom-character-set.service';
import { Character } from '../models/character.model';
import {
  JikanApiService,
  JikanCharacterResult,
  JikanAnimeResult,
  JikanAnimeCharacter,
} from './jikan-api.service';

// --- Define robust state interfaces ---

// Represents a character being prepared for upload (from either source)
interface CharacterCropState {
  // Unique ID for tracking in the UI (e.g., for @for loops)
  readonly id: string;
  // Unique ID from the source API, used to prevent duplicates
  readonly sourceId: number | string;
  name: string;
  imageBase64: string;
  croppedDataUrl: string | null;
  // The source tab this character came from
  source: 'upload' | 'search';
}

// Unified state object for the entire component
interface ComponentState {
  status:
    | 'idle'
    | 'loading'
    | 'error'
    | 'submitting'
    | 'searchingAnime'
    | 'fetchingCharacters';
  error: string | null;
  animeSearchQuery: string;
  animeSearchResults: JikanAnimeResult[];
  selectedAnime: JikanAnimeResult | null;
  characterSearchResults: JikanCharacterResult[];
  characters: CharacterCropState[];
}

@Component({
  selector: 'app-custom-character-set-upload-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgOptimizedImage,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ImageCropperComponent,
  ],
  templateUrl: './custom-character-set-upload.page.html', // Use templateUrl for cleaner code
  styleUrls: ['./custom-character-set-upload.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomCharacterSetUploadPage {
  // --- Injected Services ---
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private customSetService = inject(CustomCharacterSetService);
  private jikanApiService = inject(JikanApiService);

  // --- Reactive Form ---
  form = this.fb.group({
    setName: ['', [Validators.required, Validators.maxLength(50)]],
  });

  // --- Unified State Signal ---
  readonly state = signal<ComponentState>({
    status: 'idle',
    error: null,
    animeSearchQuery: '',
    animeSearchResults: [],
    selectedAnime: null,
    characterSearchResults: [],
    characters: [],
  });

  // --- Computed Signals for Derived State ---
  readonly selectedTabIndex = signal(0);
  readonly isSearchTab = computed(() => this.selectedTabIndex() === 1);

  // Filtered lists for each tab, derived from the single source of truth
  readonly uploadTabCharacters = computed(() =>
    this.state().characters.filter((c) => c.source === 'upload')
  );
  readonly searchTabCharacters = computed(() =>
    this.state().characters.filter((c) => c.source === 'search')
  );
  readonly selectedSearchCharacterIds = computed(
    () => new Set(this.searchTabCharacters().map((c) => c.sourceId))
  );

  // Simplified conditional logic for the view
  readonly isSubmitting = computed(() => this.state().status === 'submitting');
  readonly isSearching = computed(() => this.state().status === 'loading');
  readonly isAnimeSearchDisabled = computed(
    () =>
      this.state().status === 'searchingAnime' ||
      !this.state().animeSearchQuery.trim()
  );

  private readonly isSetNameValid = toSignal(
    this.form.controls.setName.statusChanges,
    {
      initialValue: this.form.controls.setName.status,
    }
  );

  readonly isUploadDisabled = computed(() => {
    const setNameValid = this.isSetNameValid() === 'VALID';
    const hasEnoughCharacters = this.croppedCharacterCount() > 1;
    return !setNameValid || !hasEnoughCharacters || this.isSubmitting();
  });

  readonly showCropMessage = computed(
    () =>
      this.state().characters.length > 0 &&
      !this.state().characters.some((c) => c.croppedDataUrl)
  );

  readonly croppedCharacterCount = computed(
    () => this.state().characters.filter((c) => c.croppedDataUrl).length
  );

  // --- Event Handlers ---

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    // Create a CharacterCropState for each valid file
    const newCharactersPromises = Array.from(input.files).map(async (file) => {
      const id = crypto.randomUUID();
      return {
        id,
        sourceId: id, // For file uploads, the unique ID is the source ID
        name: file.name.replace(/\.[^/.]+$/, ''), // Clean file name
        imageBase64: await this.fileToDataUrl(file),
        croppedDataUrl: null,
        source: 'upload' as const,
      };
    });

    const newCharacters = await Promise.all(newCharactersPromises);

    // Update state immutably, adding new characters
    this.state.update((s) => ({
      ...s,
      characters: [...s.characters, ...newCharacters],
    }));

    // Reset the file input to allow selecting the same file again
    input.value = '';
  }

  onSearchQueryInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.state.update((s) => ({ ...s, animeSearchQuery: query }));
  }

  async onSearchAnime(): Promise<void> {
    const query = this.state().animeSearchQuery.trim();
    if (!query) return;

    this.state.update((s) => ({ ...s, status: 'searchingAnime', error: null }));
    try {
      const results = await this.jikanApiService.searchAnime(query);
      this.state.update((s) => ({
        ...s,
        animeSearchResults: results,
        status: 'idle',
      }));
    } catch (err) {
      this.state.update((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        animeSearchResults: [],
      }));
    }
  }

  async onSelectAnime(anime: JikanAnimeResult): Promise<void> {
    this.state.update((s) => ({
      ...s,
      selectedAnime: anime,
      status: 'fetchingCharacters',
      error: null,
    }));
    try {
      const characters = await this.jikanApiService.getAnimeCharacters(
        anime.mal_id
      );
      const characterResults: JikanCharacterResult[] = characters.map(
        (c) => c.character
      );
      this.state.update((s) => ({
        ...s,
        characterSearchResults: characterResults,
        status: 'idle',
      }));
    } catch (err) {
      this.state.update((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'An unknown error occurred',
        characterSearchResults: [],
      }));
    }
  }

  async onSelectCharacter(char: JikanCharacterResult): Promise<void> {
    if (this.selectedSearchCharacterIds().has(char.mal_id)) {
      this.state.update((s) => ({
        ...s,
        characters: s.characters.filter((c) => c.sourceId !== char.mal_id),
      }));
      return;
    }

    const imageUrl =
      char.images?.jpg?.image_url || char.images?.webp?.image_url;
    if (!imageUrl) return;

    try {
      // Use a proxy for CORS issues if necessary, or fetch directly
      const imageBase64 = await this.fetchImageAsBase64(imageUrl);
      const newCharacter: CharacterCropState = {
        id: crypto.randomUUID(),
        sourceId: char.mal_id,
        name: char.name,
        imageBase64,
        croppedDataUrl: imageBase64, // Initialize croppedDataUrl with imageBase64
        source: 'search' as const,
      };

      this.state.update((s) => ({
        ...s,
        characters: [...s.characters, newCharacter],
      }));
    } catch (error) {
      console.error('Failed to fetch character image:', error);
      this.state.update((s) => ({
        ...s,
        error: 'Could not load character image.',
      }));
    }
  }

  onCharacterNameInput(id: string, event: Event): void {
    const newName = (event.target as HTMLInputElement).value;
    this.updateCharacter(id, { name: newName });
  }

  onImageCropped(id: string, event: ImageCroppedEvent): void {
    this.updateCharacter(id, { croppedDataUrl: event.base64 ?? null });
  }

  async onUpload(): Promise<void> {
    if (this.isUploadDisabled()) return;

    this.state.update((s) => ({ ...s, status: 'submitting', error: null }));

    const charactersToUpload: Character[] = this.state()
      .characters.filter((c) => c.croppedDataUrl) // Ensure image is cropped
      .map(({ name, croppedDataUrl }) => ({
        name: name || 'Unnamed',
        imageUrl: croppedDataUrl!,
      }));

    if (charactersToUpload.length === 0) {
      this.state.update((s) => ({
        ...s,
        status: 'error',
        error: 'No characters with cropped images to upload.',
      }));
      return;
    }

    try {
      await this.customSetService.uploadCharacterSet(
        this.form.value.setName!,
        charactersToUpload
      );
      await this.router.navigateByUrl('/'); // Navigate on success
    } catch (err) {
      console.error('Upload failed:', err);
      this.state.update((s) => ({
        ...s,
        status: 'error',
        error: 'Upload failed. Please try again.',
      }));
    }
  }

  onCancel(): void {
    this.router.navigateByUrl('/');
  }

  backToAnimeSearch(): void {
    this.state.update((s) => ({
      ...s,
      selectedAnime: null,
      characterSearchResults: [],
      status: 'idle',
      error: null,
    }));
  }

  // --- Private Helper Methods ---

  private updateCharacter(
    id: string,
    props: Partial<CharacterCropState>
  ): void {
    this.state.update((s) => ({
      ...s,
      characters: s.characters.map((char) =>
        char.id === id ? { ...char, ...props } : char
      ),
    }));
  }

  private async fileToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    // Note: Fetching images from external domains might be blocked by CORS.
    // A backend proxy may be required in a real-world application.
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return this.fileToDataUrl(blob);
  }
}

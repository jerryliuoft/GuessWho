import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface Character {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'character-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    MatCardModule,
    MatRippleModule,
    MatIconModule,
    CommonModule,
  ],
  template: `
    <div class="character-grid-toolbar">
      <button
        type="button"
        class="reset-btn"
        (click)="resetMarks()"
        aria-label="Reset all marks"
      >
        <mat-icon>refresh</mat-icon> Reset All
      </button>
      <button
        type="button"
        class="sort-toggle-btn"
        (click)="toggleSortUnmarkedFirst()"
        [attr.aria-pressed]="sortUnmarkedFirst()"
        [title]="
          sortUnmarkedFirst() ? 'Show marked at end' : 'Show original order'
        "
      >
        <mat-icon>{{
          sortUnmarkedFirst() ? 'filter_alt' : 'filter_alt_off'
        }}</mat-icon>
        {{ sortUnmarkedFirst() ? 'Unmarked First' : 'Original Order' }}
      </button>
      <span class="remaining-count" aria-live="polite">
        {{ characters().length - markedCount() }} remaining
      </span>
    </div>
    <div class="character-grid">
      @for (character of characters(); track character.name) {
      <mat-card
        class="character-tile"
        [class.marked]="isMarked(character)"
        [class.target-tile]="target() && character.name === target()?.name"
        (click)="toggleMark(character)"
        (keydown.enter)="toggleMark(character)"
        (keydown.space)="toggleMark(character)"
        matRipple
        [matRippleColor]="isMarked(character) ? '#bdbdbd' : '#e0e7ef'"
        tabindex="0"
        role="button"
        [attr.aria-pressed]="isMarked(character)"
        [attr.aria-label]="
          character.name +
          (isMarked(character) ? ' (marked as eliminated)' : '') +
          (target() && character.name === target()?.name
            ? ' (target character)'
            : '')
        "
        [attr.title]="character.name"
      >
        @if (isMarked(character)) {
        <span class="visually-hidden">Marked as eliminated</span>
        } @if (target() && character.name === target()?.name) {
        <span
          class="target-indicator"
          aria-label="Target character"
          title="Target character"
        >
          <mat-icon class="target-icon">star</mat-icon>
        </span>
        } @if (character.imageUrl.startsWith('data:')) {
        <img
          [attr.src]="character.imageUrl"
          width="100"
          height="100"
          alt="{{ character.name }}"
          class="character-img"
        />
        } @else {
        <img
          [ngSrc]="character.imageUrl"
          width="100"
          height="100"
          alt="{{ character.name }}"
          class="character-img"
        />
        }
        <div class="character-name">{{ character.name }}</div>
      </mat-card>
      }
    </div>
  `,
  styleUrls: ['./character-grid.component.scss'],
})
export class CharacterGridComponent {
  target = input<Character | null>();

  private _characters = signal<Character[]>([]);
  private _marked = signal<Set<string>>(new Set());
  private _sortUnmarkedFirst = signal(true);

  input(characters: Character[]) {
    this._characters.set(characters);
    this._marked.set(new Set()); // Reset marks when new set is loaded
  }

  sortUnmarkedFirst = computed(() => this._sortUnmarkedFirst());

  toggleSortUnmarkedFirst() {
    this._sortUnmarkedFirst.set(!this._sortUnmarkedFirst());
  }

  characters = computed(() => {
    const chars = this._characters();
    if (!this._sortUnmarkedFirst()) return chars;
    const marked = this._marked();
    return [...chars].sort((a, b) => {
      const aMarked = marked.has(a.name);
      const bMarked = marked.has(b.name);
      if (aMarked === bMarked) return 0;
      return aMarked ? 1 : -1;
    });
  });
  markedCount = computed(() => this._marked().size);

  isMarked(character: Character): boolean {
    return this._marked().has(character.name);
  }

  toggleMark(character: Character) {
    const marked = new Set(this._marked());
    if (marked.has(character.name)) {
      marked.delete(character.name);
    } else {
      marked.add(character.name);
    }
    this._marked.set(marked);
  }

  resetMarks() {
    this._marked.set(new Set());
  }
}

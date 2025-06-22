import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

export interface Character {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'character-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, MatCardModule, MatRippleModule, MatIconModule],
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
      <span class="remaining-count" aria-live="polite">
        {{ characters().length - markedCount() }} remaining
      </span>
    </div>
    <div class="character-grid">
      @for (character of characters(); track character.name) {
      <mat-card
        class="character-tile"
        [class.marked]="isMarked(character)"
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
          (isMarked(character) ? ' (marked as eliminated)' : '')
        "
        [attr.title]="character.name"
      >
        @if (isMarked(character)) {
        <span class="visually-hidden">Marked as eliminated</span>
        }
        <img
          [ngSrc]="character.imageUrl"
          width="100"
          height="100"
          alt="{{ character.name }}"
          class="character-img"
        />
        <div class="character-name">{{ character.name }}</div>
      </mat-card>
      }
    </div>
  `,
  styleUrls: ['./character-grid.component.scss'],
})
export class CharacterGridComponent {
  private _characters = signal<Character[]>([]);
  private _marked = signal<Set<string>>(new Set());

  input(characters: Character[]) {
    this._characters.set(characters);
    this._marked.set(new Set()); // Reset marks when new set is loaded
  }

  characters = computed(() => this._characters());
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

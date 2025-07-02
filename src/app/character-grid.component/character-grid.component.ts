import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  computed,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { GameService } from '../game.service';

// Character now imported from models

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
        (click)="
          game.sortUnmarkedFirst() ? game.toggleSort() : game.toggleSort()
        "
        [attr.aria-pressed]="game.sortUnmarkedFirst()"
        [title]="
          game.sortUnmarkedFirst()
            ? 'Show marked at end'
            : 'Show original order'
        "
      >
        <mat-icon>{{
          game.sortUnmarkedFirst() ? 'filter_alt' : 'filter_alt_off'
        }}</mat-icon>
        {{ game.sortUnmarkedFirst() ? 'Unmarked First' : 'Original Order' }}
      </button>
      <span class="remaining-count" aria-live="polite">
        {{ game.sortedCharacters().length - game.marked().size }} remaining
      </span>
    </div>
    <div class="character-grid">
      @for (character of game.sortedCharacters(); track character.name) {
      <mat-card
        class="character-tile"
        [class.marked]="game.isMarked(character)"
        [class.target-tile]="
          game.mysteryCharacter() &&
          character.name === game.mysteryCharacter()?.name
        "
        (click)="game.toggleMark(character)"
        (keydown.enter)="game.toggleMark(character)"
        (keydown.space)="game.toggleMark(character)"
        matRipple
        [matRippleColor]="game.isMarked(character) ? '#bdbdbd' : '#e0e7ef'"
        tabindex="0"
        role="button"
        [attr.aria-pressed]="game.isMarked(character)"
        [attr.aria-label]="
          character.name +
          (game.isMarked(character) ? ' (marked as eliminated)' : '') +
          (game.mysteryCharacter() &&
          character.name === game.mysteryCharacter()?.name
            ? ' (target character)'
            : '')
        "
        [attr.title]="character.name"
      >
        @if (game.isMarked(character)) {
        <span class="visually-hidden">Marked as eliminated</span>
        <span class="marked-overlay" aria-hidden="true">
          <mat-icon class="marked-icon" fontIcon="cancel" aria-hidden="true"
            >cancel</mat-icon
          >
        </span>
        } @if (game.mysteryCharacter() && character.name ===
        game.mysteryCharacter()?.name) {
        <span
          class="target-indicator"
          aria-label="Target character"
          title="Target character"
        >
          <mat-icon class="target-icon">star</mat-icon>
        </span>
        }
        @if (character.imageUrl && character.imageUrl.startsWith('data:')) {
          <img
            [attr.src]="character.imageUrl"
            width="100"
            height="100"
            alt="{{ character.name }}"
            class="character-img"
          />
        } @else if (character.imageUrl) {
          <img
            [ngSrc]="character.imageUrl"
            width="100"
            height="100"
            alt="{{ character.name }}"
            class="character-img"
            [attr.priority]="isLCP(character) ? '' : null"
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
  game = inject(GameService);

  resetMarks() {
    this.game
      .marked()
      .forEach((name) => this.game.toggleMark({ name, imageUrl: '' }));
  }

  isLCP(character: any): boolean {
    return this.game.sortedCharacters()[0]?.name === character.name;
  }
}

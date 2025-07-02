import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Character } from './models/character.model';

@Component({
  selector: 'your-character',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    @if (character()) {
    <div class="your-character">
      <span class="your-character-label">Your Character</span>
      <img
        [ngSrc]="character()!.imageUrl"
        width="64"
        height="64"
        alt="Your character: {{ character()!.name }}"
        class="your-character-image"
        priority
      />
      <span class="your-character-name">{{ character()!.name }}</span>
    </div>
    }
  `,
  styleUrl: './your-character.component.scss',
  standalone: true,
})
export class YourCharacterComponent {
  character = input<Character | null>();
}

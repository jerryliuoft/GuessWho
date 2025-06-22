import { Injectable, signal, computed } from '@angular/core';
import { Character } from './character-grid.component/character-grid.component';

@Injectable({ providedIn: 'root' })
export class GameService {
  private _characterSet = signal<Character[]>([]);
  private _mysteryCharacter = signal<Character | null>(null);

  characterSet = computed(() => this._characterSet());
  mysteryCharacter = computed(() => this._mysteryCharacter());

  setCharacterSet(characters: Character[]) {
    this._characterSet.set(characters);
    this.pickMysteryCharacter();
  }

  pickMysteryCharacter() {
    const set = this._characterSet();
    if (set.length > 0) {
      const idx = Math.floor(Math.random() * set.length);
      this._mysteryCharacter.set(set[idx]);
    } else {
      this._mysteryCharacter.set(null);
    }
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { Character, CharacterSet } from './models/character.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private _characterSet = signal<CharacterSet | null>(null);
  private _mysteryCharacter = signal<Character | null>(null);
  private _marked = signal<Set<string>>(new Set());
  private _sortUnmarkedFirst = signal(true);

  characterSet = computed(() => this._characterSet());
  characters = computed(() => this._characterSet()?.characters ?? []);
  mysteryCharacter = computed(() => this._mysteryCharacter());
  marked = computed(() => this._marked());
  sortUnmarkedFirst = computed(() => this._sortUnmarkedFirst());

  loadSet(set: CharacterSet) {
    this._characterSet.set(set);
    this._marked.set(new Set());
    this.pickMysteryCharacter();
  }

  pickMysteryCharacter() {
    const chars = this._characterSet()?.characters ?? [];
    if (chars.length > 0) {
      const idx = Math.floor(Math.random() * chars.length);
      this._mysteryCharacter.set(chars[idx]);
    } else {
      this._mysteryCharacter.set(null);
    }
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

  isMarked(character: Character): boolean {
    return this._marked().has(character.name);
  }

  toggleSort() {
    this._sortUnmarkedFirst.set(!this._sortUnmarkedFirst());
  }

  sortedCharacters = computed(() => {
    const chars = this._characterSet()?.characters ?? [];
    if (!this._sortUnmarkedFirst()) return chars;
    const marked = this._marked();
    return [...chars].sort((a, b) => {
      const aMarked = marked.has(a.name);
      const bMarked = marked.has(b.name);
      if (aMarked === bMarked) return 0;
      return aMarked ? 1 : -1;
    });
  });
}

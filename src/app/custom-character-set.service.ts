import { Injectable } from '@angular/core';
import { Database, ref, set, push } from '@angular/fire/database';
import { Character, CharacterSet } from './models/character.model';

@Injectable({ providedIn: 'root' })
export class CustomCharacterSetService {
  constructor(private db: Database) {}

  async uploadCharacterSet(
    setName: string,
    characters: Character[]
  ): Promise<void> {
    try {
      const setRef = push(ref(this.db, 'characterSets'));
      const characterSet: CharacterSet = {
        name: setName,
        characters,
      };
      await set(setRef, characterSet);
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }
}

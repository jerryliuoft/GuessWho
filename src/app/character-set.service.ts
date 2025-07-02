import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { CharacterSet } from './models/character.model';

// DEMO_SET is now defined and exported from models/character.model.ts

@Injectable({ providedIn: 'root' })
export class CharacterSetService {
  private db = inject(Database);
  private sets = signal<CharacterSet[]>([]);

  getCharacterSets() {
    const setsRef = ref(this.db, 'characterSets');
    onValue(setsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Defensive: ensure set.characters is always an array
        const arr = Object.values(val).map((set: any) => ({
          ...set,
          characters: Array.isArray(set.characters)
            ? set.characters.map((c: any) => ({
                name: c.name,
                imageUrl: c.imageUrl ?? '',
              }))
            : [],
        })) as CharacterSet[];
        this.sets.set(arr);
      } else {
        this.sets.set([]);
      }
    });
    return this.sets;
  }
}

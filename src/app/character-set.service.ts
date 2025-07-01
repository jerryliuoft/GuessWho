import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';

export interface CharacterSet {
  name: string;
  characters: { name: string; imageUrl: string }[];
}

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
                imageUrl: c.imageDataUrl ?? c.imageUrl ?? '',
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

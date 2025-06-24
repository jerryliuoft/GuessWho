import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, onValue } from '@angular/fire/database';
import { CharacterSet } from './custom-character-set.service';

@Injectable({ providedIn: 'root' })
export class CharacterSetService {
  private db = inject(Database);
  private sets = signal<CharacterSet[]>([]);

  getCharacterSets() {
    const setsRef = ref(this.db, 'characterSets');
    onValue(setsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const arr = Object.values(val) as CharacterSet[];
        this.sets.set(arr);
      } else {
        this.sets.set([]);
      }
    });
    return this.sets;
  }
}

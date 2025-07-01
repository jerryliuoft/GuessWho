import { Injectable } from '@angular/core';
import { Database, ref, set, push } from '@angular/fire/database';

export interface Character {
  name: string;
  imageFile: File;
}

export interface CharacterSet {
  name: string;
  characters: Array<{ name: string; imageDataUrl: string }>;
}

@Injectable({ providedIn: 'root' })
export class CustomCharacterSetService {
  constructor(private db: Database) {}

  async uploadCharacterSet(
    setName: string,
    characters: Character[]
  ): Promise<void> {
    try {
      const uploadedCharacters = await Promise.all(
        characters.map(async (character) => {
          const imageDataUrl = await this.fileToDataUrl(character.imageFile);
          return { name: character.name, imageDataUrl };
        })
      );
      const setRef = push(ref(this.db, 'characterSets'));
      const characterSet: CharacterSet = {
        name: setName,
        characters: uploadedCharacters,
      };
      await set(setRef, characterSet);
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

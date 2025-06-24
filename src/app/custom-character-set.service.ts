import { Injectable, inject } from '@angular/core';
import { Database, ref, set, push } from '@angular/fire/database';
import {
  Storage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';

export interface Character {
  name: string;
  imageFile: File;
}

export interface CharacterSet {
  name: string;
  characters: Array<{ name: string; imageUrl: string }>;
}

@Injectable({ providedIn: 'root' })
export class CustomCharacterSetService {
  private db = inject(Database);
  private storage = inject(Storage);

  async uploadCharacterSet(
    setName: string,
    characters: Character[]
  ): Promise<void> {
    // Upload all images and get their URLs
    const uploadedCharacters = await Promise.all(
      characters.map(async (character) => {
        const imgPath = `character-sets/${setName}/${character.name}`;
        const imgRef = storageRef(this.storage, imgPath);
        await uploadBytes(imgRef, character.imageFile);
        const imageUrl = await getDownloadURL(imgRef);
        return { name: character.name, imageUrl };
      })
    );
    // Save the character set to the database
    const setRef = push(ref(this.db, 'characterSets'));
    const characterSet: CharacterSet = {
      name: setName,
      characters: uploadedCharacters,
    };
    await set(setRef, characterSet);
  }
}

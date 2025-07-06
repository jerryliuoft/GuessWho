import { Injectable } from '@angular/core';

// Define a clear interface for the API response
export interface JikanCharacterResult {
  mal_id: number;
  name: string;
  images: {
    jpg?: { image_url?: string };
    webp?: { image_url?: string };
  };
}

export interface JikanAnimeResult {
  mal_id: number;
  title: string;
  images: {
    jpg?: { image_url?: string };
    webp?: { image_url?: string };
  };
}

export interface JikanAnimeCharacter {
  character: JikanCharacterResult;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class JikanApiService {
  private readonly baseUrl = 'https://api.jikan.moe/v4';

  async searchAnime(query: string): Promise<JikanAnimeResult[]> {
    if (!query) {
      return [];
    }
    const url = `${this.baseUrl}/anime?q=${encodeURIComponent(query)}&limit=10`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Jikan API responded with status ${response.status}`);
      }
      const data = (await response.json()) as { data: JikanAnimeResult[] };
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      console.error('Jikan API anime search failed:', error);
      throw new Error('Failed to fetch anime. The API might be down.');
    }
  }

  async getAnimeCharacters(animeId: number): Promise<JikanAnimeCharacter[]> {
    const url = `${this.baseUrl}/anime/${animeId}/characters`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Jikan API responded with status ${response.status}`);
      }
      const data = (await response.json()) as { data: JikanAnimeCharacter[] };
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      console.error('Jikan API get anime characters failed:', error);
      throw new Error('Failed to fetch anime characters. The API might be down.');
    }
  }

  // This method is no longer used, but keeping it for now until the component is updated.
  async searchCharacters(query: string): Promise<JikanCharacterResult[]> {
    if (!query) {
      return [];
    }
    const url = `${this.baseUrl}/characters?q=${encodeURIComponent(
      query
    )}&limit=15`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        // More specific error handling
        throw new Error(`Jikan API responded with status ${response.status}`);
      }
      const data = (await response.json()) as { data: JikanCharacterResult[] };
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      console.error('Jikan API search failed:', error);
      // Re-throw a more user-friendly error for the component to catch
      throw new Error('Failed to fetch characters. The API might be down.');
    }
  }
}

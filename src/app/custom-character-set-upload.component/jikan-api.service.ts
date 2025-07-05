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

@Injectable({
  providedIn: 'root',
})
export class JikanApiService {
  private readonly baseUrl = 'https://api.jikan.moe/v4';

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

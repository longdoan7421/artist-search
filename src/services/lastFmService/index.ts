import randomArtists from '@/data/randomArtists.json';
import { Artist } from '@/entities/Artist';
import { getMultipleRandomElements } from '@/utils/random';
import axios, { AxiosResponse } from 'axios';
import { artistSearchSchema } from './validation';

export const api = axios.create({
  baseURL: process.env.LAST_FM_API_URL,
  timeout: 0,
});

const MAX_ITEMS_PER_PAGE = 10000; // 10000 is the maximum limit allowed by Last.fm API

interface SearchArtistByNameReturnType {
  totalResults: number;
  currentPage: number;
  limit: number;
  artists: Artist[];
}

export const searchArtistByName = async (
  name: string,
  page = 1,
  limit = 30,
): Promise<SearchArtistByNameReturnType> => {
  if (limit > MAX_ITEMS_PER_PAGE) {
    limit = MAX_ITEMS_PER_PAGE;
  }

  try {
    const params = {
      method: 'artist.search',
      api_key: process.env.LAST_FM_API_KEY,
      format: 'json',
      artist: name,
      page,
      limit,
    };
    const response: AxiosResponse = await api.get('/2.0', { params });

    const parsedResult = artistSearchSchema.safeParse(response.data);

    if (!parsedResult.success) {
      return Promise.reject(
        new Error('Error while parsing Last.fm API response', { cause: parsedResult.error }),
      );
    }

    let artists: Artist[] = parsedResult.data.results.artistmatches.artist.map((artist) => {
      return {
        name: artist.name,
        mbid: artist.mbid,
        url: artist.url,
        imageSmall: artist.image.find((image) => image.size === 'small')?.['#text'] || '',
        image: artist.image.find((image) => image.size === 'medium')?.['#text'] || '',
      };
    });

    // If the API returns no results, we return a random list of artists
    if (artists.length === 0) {
      artists = getMultipleRandomElements(randomArtists, limit);
    }

    return {
      totalResults: parsedResult.data.results['opensearch:totalResults'],
      currentPage: page,
      limit: limit,
      artists,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return Promise.reject(
        new Error('Error while fetching data from Last.fm API', { cause: error }),
      );
    }

    return Promise.reject(
      new Error('Unknown error while fetching data from Last.fm API', { cause: error }),
    );
  }
};

const lastFmService = {
  searchArtistByName,
};

export default lastFmService;

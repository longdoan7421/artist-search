import { Artist } from '@/entities/Artist';
import axios, { AxiosResponse } from 'axios';
import { artistSearchSchema } from './validation';

const api = axios.create({
  baseURL: process.env.LAST_FM_API_URL,
  timeout: 0,
});

interface SearchArtistByNameReturnType {
  totalResults: number;
  currentPage: number;
  limit: number;
  artists: Artist[];
}

const searchArtistByName = async (
  name: string,
  page = 1,
  limit = 30,
): Promise<SearchArtistByNameReturnType> => {
  try {
    const response: AxiosResponse = await api.get(
      '/2.0/?method=artist.search&artist=' +
        name +
        '&api_key=' +
        process.env.LAST_FM_API_KEY +
        '&format=json&page=' +
        page +
        '&limit=' +
        limit,
    );

    const parsedResult = artistSearchSchema.safeParse(response.data);

    if (!parsedResult.success) {
      return Promise.reject(
        new Error('Error while parsing Last.fm API response', { cause: parsedResult.error }),
      );
    }

    const artists: Artist[] = parsedResult.data.results.artistmatches.artist.map((artist) => {
      return {
        name: artist.name,
        mbid: artist.mbid,
        url: artist.url,
        imageSmall: artist.image.find((image) => image.size === 'small')?.['#text'] || '',
        image: artist.image.find((image) => image.size === 'medium')?.['#text'] || '',
      };
    });

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

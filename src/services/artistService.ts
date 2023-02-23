import { Artist } from '@/entities/Artist';
import lastFmService from '@/services/lastFmService';
import { PagedResult } from '@/types/common';
import stream from 'node:stream';

/**
 * Retrieve artists with given name
 */
async function searchArtistWithName(
  name: string,
  page?: number,
  limit?: number,
): Promise<PagedResult<Artist>> {
  try {
    const result = await lastFmService.searchArtistByName(name, page, limit);

    return {
      totalResults: result.totalResults,
      currentPage: result.currentPage,
      totalPage: Math.ceil(result.totalResults / result.limit),
      pageSize: result.limit,
      items: result.artists,
    };
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Retrieve all artists with given name and return all results as a readable stream
 */
function searchAllArtistsWithName(name: string): stream.Readable {
  let currentPage = 1;
  let totalPage = 1;
  const limit = 1000;

  const readableStream = new stream.Readable();
  readableStream.setEncoding('utf8');
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readableStream._read = () => {};

  lastFmService.searchArtistByName(name, currentPage, limit).then((result) => {
    totalPage = Math.ceil(result.totalResults / limit);
    readableStream.push(JSON.stringify(result.artists));

    const remainingResultPromises = [];
    while (currentPage < totalPage) {
      currentPage++;
      const nextPageResultPromise = lastFmService
        .searchArtistByName(name, currentPage, limit)
        .then((nextPageResult) => {
          readableStream.push(JSON.stringify(nextPageResult.artists));
        });
      remainingResultPromises.push(nextPageResultPromise);
    }

    Promise.all(remainingResultPromises)
      .then(() => {
        readableStream.push(null);
      })
      .catch((err) => {
        readableStream.emit('error', err);
      });
  });

  return readableStream;
}

const artistService = {
  searchArtistWithName,
  searchAllArtistsWithName,
};

export default artistService;

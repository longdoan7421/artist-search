import lastFmService from '@/services/lastFmService';
import stream from 'node:stream';

function findAllArtistByName(name: string): stream.Readable {
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
  findAllArtistByName,
};

export default artistService;

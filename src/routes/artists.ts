import { FastifyInstance } from 'fastify';
import lastFmService from '@/services/lastFmService';

export async function routes(server: FastifyInstance, options: any) {
  interface IArtistSearchQueryString {
    name?: string;
    filename?: string;
  }

  server.get(
    '/artists',
    {
      preValidation: (req, res, done) => {
        const { filename } = req.query as IArtistSearchQueryString;
        if (!filename) {
          res.status(400).send({ error: 'Querystring "filename" is required' });
          return;
        }
        done();
      },
    },
    async function (req, res) {
      let { name, filename } = req.query as IArtistSearchQueryString;
      if (!name) {
        name = 'taylor swift'; // TODO: get random name from json source
      }

      try {
        let currentPage = 1;
        let totalPage = 1;
        const limit = 10000; // Last.fm API limit to 10000 results per query
        const result = await lastFmService.searchArtistByName(name, currentPage, limit);

        totalPage = Math.ceil(result.totalResults / 1000);

        while (currentPage < totalPage) {
          currentPage++;
          const nextPageResult = await lastFmService.searchArtistByName(name, currentPage, 1000);
          result.artists = result.artists.concat(nextPageResult.artists);
        }

        res.send({ artists: result.artists, totalResults: result.totalResults });
      } catch (error) {
        req.log.error(error);
        res.status(500).send({ error: (error as any)?.message ?? 'Unexpected error' });
      }
    },
  );
}

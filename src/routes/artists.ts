import lastFmService from '@/services/lastFmService';
import { stringify } from 'csv-stringify';
import { FastifyInstance } from 'fastify';
import path from 'node:path';

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
      filename = path.parse(filename!).name;
      if (!name) {
        name = 'taylor swift'; // TODO: get random name from json source
      }

      try {
        let currentPage = 1;
        let totalPage = 1;
        const limit = 10000;
        const result = await lastFmService.searchArtistByName(name, currentPage, limit);

        totalPage = Math.ceil(result.totalResults / limit);

        const stringifier = stringify({
          delimiter: ',',
          header: true,
          columns: ['name', 'mbid', 'url', 'imageSmall', 'image'],
          quoted: true,
        });

        stringifier.on('error', (err) => {
          req.log.error(err);
        });

        result.artists.forEach((artist) => {
          stringifier.write(artist);
        });

        while (currentPage < totalPage) {
          currentPage++;
          const nextPageResult = await lastFmService.searchArtistByName(name, currentPage, 1000);
          nextPageResult.artists.forEach((artist) => {
            stringifier.write(artist);
          });
        }

        stringifier.end();

        res.headers({
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${filename}.csv`,
        });

        return res.send(stringifier);
      } catch (error) {
        req.log.error(error);
        res.status(500).send(error);
      }
    },
  );
}

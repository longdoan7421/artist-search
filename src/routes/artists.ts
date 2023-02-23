import { Artist } from '@/entities/Artist';
import artistService from '@/services/artistService';
import { stringify } from 'csv-stringify';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import path from 'node:path';

export async function routes(server: FastifyInstance, options: FastifyPluginOptions) {
  const searchArtistsQueryStringSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: ['name'],
  } as const;

  server.get<{ Querystring: FromSchema<typeof searchArtistsQueryStringSchema> }>(
    '/',
    {
      schema: {
        querystring: searchArtistsQueryStringSchema,
      },
    },
    async function (req, res) {
      let { name: artistName, page, limit } = req.query;
      try {
        const result = await artistService.searchArtistWithName(artistName, page, limit);

        return res.status(200).send(result);
      } catch (error) {
        req.log.error(error, 'Failed to search artist');
        return res.status(500).send({ message: 'Failed to search artist' });
      }
    },
  );

  const saveArtistsToCsvQueryStringSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['name', 'filename'],
  } as const;

  server.get<{ Querystring: FromSchema<typeof saveArtistsToCsvQueryStringSchema> }>(
    '/files',
    {
      schema: {
        querystring: saveArtistsToCsvQueryStringSchema,
      },
    },
    async function (req, res) {
      let { name: artistName, filename } = req.query;
      filename = path.parse(filename).name;

      const stringifier = stringify({
        delimiter: ',',
        header: true,
        columns: ['name', 'mbid', 'url', 'imageSmall', 'image'],
        quoted: true,
      });

      stringifier.on('error', (err) => {
        req.log.error(err, 'stringifier stream occurred error');
      });

      try {
        const resultStream = artistService.searchAllArtistsWithName(artistName);
          resultStream.on('readable', () => {
            let row;
            while ((row = resultStream.read()) !== null) {
              const parsedRow = JSON.parse(row) as Artist[];
              parsedRow.forEach((artist: Artist) => {
                stringifier.write(artist);
              });
            }
          });

          resultStream.on('error', (err) => {
            req.log.error(err, `result stream of finding artist ${artistName} occurred error`);
          });

          resultStream.on('end', () => {
            stringifier.end();
          });

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

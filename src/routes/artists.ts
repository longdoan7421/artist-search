import randomArtists from '@/data/randomArtists.json';
import { Artist } from '@/entities/Artist';
import artistService from '@/services/artistService';
import { stringify } from 'csv-stringify';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import path from 'node:path';
import stream from 'node:stream';

export async function routes(server: FastifyInstance, options: FastifyPluginOptions) {
  const searchArtistsQueryStringSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      filename: { type: 'string' },
    },
    required: ['filename'],
  } as const;

  server.get<{ Querystring: FromSchema<typeof searchArtistsQueryStringSchema> }>(
    '/artists',
    {
      schema: {
        querystring: searchArtistsQueryStringSchema,
      },
    },
    async function (req, res) {
      let { name, filename } = req.query;
      filename = path.parse(filename).name;
      let artistNames: string[] = name ? [name] : randomArtists;

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
        const allResultStreams: stream.Readable[] = [];
        for (const artistName of artistNames) {
          const resultStream = artistService.findAllArtistByName(artistName);
          allResultStreams.push(resultStream);
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
            const isAllStreamEnded =
              allResultStreams.length === artistNames.length &&
              allResultStreams.every((stream) => stream.readableEnded);
            isAllStreamEnded && stringifier.end();
          });
        }

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

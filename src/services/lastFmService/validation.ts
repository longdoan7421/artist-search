import { z } from 'zod';

export const artistSearchSchema = z.object({
  results: z.object({
    'opensearch:totalResults': z.string().transform(val => +val),
    'opensearch:startIndex': z.string().transform(val => +val),
    'opensearch:itemsPerPage': z.string().transform(val => +val),
    artistmatches: z.object({
      artist: z.array(
        z.object({
          name: z.string(),
          listeners: z.string().transform(val => +val),
          mbid: z.string(),
          url: z.string(),
          image: z.array(
            z.object({
              '#text': z.string(),
              size: z.union([
                z.literal('small'),
                z.literal('medium'),
                z.literal('large'),
                z.literal('extralarge'),
                z.literal('mega'),
              ]),
            }),
          ),
        }),
      ),
    }),
  }),
});

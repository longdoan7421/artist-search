import { beforeEach, describe, expect, test, vi } from 'vitest';
import { api, searchArtistByName } from './index';

describe('lastFmService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should return transformed data of Last.fm API response', async () => {
    // Arrange
    const currentPage = 1;
    const itemsPerPage = 2;
    const totalResults = 100;

    const spyInstance = vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: getMockResponse({ totalResults, itemsPerPage }),
    });

    // Act
    const result = await searchArtistByName('artist', currentPage, itemsPerPage);

    // Assert
    expect(spyInstance.mock.calls.length).toBe(1);
    expect(result.totalResults).toBe(totalResults);
    expect(result.artists).toHaveLength(2);
    expect(result.artists[0].name).toBe('Artist 1');
  });

  test('should use the maximum limit 10000 if limit parameter is greater than max limit', async () => {
    // Arrange
    const currentPage = 1;
    const itemsPerPage = 20000;

    const spyInstance = vi
      .spyOn(api, 'get')
      .mockResolvedValueOnce({ data: getMockResponse({ itemsPerPage: 10000, totalResults: 100 }) });

    // Act
    await searchArtistByName('artist', currentPage, itemsPerPage);

    // Assert
    expect(spyInstance.mock.calls.length).toBe(1);
    expect(spyInstance.mock.calls[0][1]?.params).toMatchObject({ limit: 10000 });
  });

  function getMockResponse(args: { totalResults: number; itemsPerPage: number }) {
    return {
      results: {
        'opensearch:totalResults': args.totalResults.toFixed(),
        'opensearch:startIndex': '0',
        'opensearch:itemsPerPage': args.itemsPerPage.toFixed(),
        artistmatches: {
          artist: [
            {
              name: 'Artist 1',
              listeners: '100',
              mbid: 'mbid 1',
              url: 'url 1',
              image: [
                {
                  '#text': 'image 1',
                  size: 'small',
                },
                {
                  '#text': 'image 2',
                  size: 'medium',
                },
              ],
            },
            {
              name: 'Artist 2',
              listeners: '200',
              mbid: 'mbid 2',
              url: 'url 2',
              image: [
                {
                  '#text': 'image 3',
                  size: 'small',
                },
                {
                  '#text': 'image 4',
                  size: 'medium',
                },
              ],
            },
          ],
        },
      },
    };
  }
});

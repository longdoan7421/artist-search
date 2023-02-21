# Artist search

Searching artist and save all results to csv file by using API of [last.fm](https://www.last.fm).

## How to start the demo

**Prerequisite**:
* node >= 18.0.0

1. Install dependencies

```bash
npm install
```

2. Create a file `.env` based on file `.env.sample` and replace value of key `LAST_FM_API_KEY` with your Last.FM API key.
3. Start server (it will run on `PORT` based on configuration in `.env` file)

```bash
npm start
```

4. Search artist by calling endpoint `/api/artists?name=artist_name&filename=csv_filename`

e.g.

```bash
curl "http://localhost:3000/api/artists?name=cher&filename=cher"
```

## Author
- Long Doan

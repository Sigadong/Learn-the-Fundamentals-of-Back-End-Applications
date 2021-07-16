const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({ title, year, performer, genre, duration }) {
    const id = nanoid(16);
    const songId = `song-${id}`;
    const date = new Date();
    const insertedAt = date.toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [songId, title, year, performer, genre, duration, insertedAt, updatedAt],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add.');
    }
    await this._cacheService.delete(`songs:${date.getDay()}`);
    return result.rows[0].id;
  }

  async getSongs() {
    const date = new Date();
    try {
      const result = await this._cacheService.get(`songs:${date.getDay()}`);
      return JSON.parse(result);
    } catch (error) {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');
      await this._cacheService.set(`songs:${date.getDay()}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    const mappedResult = result.rows.map(mapDBToModel.modelSongs)[0];

    if (!result.rowCount) {
      throw new NotFoundError('Song not found!');
    }
    await this._cacheService.set(`songbyid:${id}`, JSON.stringify(mappedResult));
    return mappedResult;
  }

  async editSongById(id, { title, year, performer, genre, duration }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to update song. Id not found!');
    }
    await this._cacheService.delete(`songbyid:${id}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song failed to delete. Id not found!');
    }
    await this._cacheService.delete(`songbyid:${id}`);
  }
}

module.exports = SongsService;

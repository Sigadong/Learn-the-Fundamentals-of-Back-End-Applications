const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.verifyPlaylistSongs(playlistId, songId);
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song failed to add to playlists.');
    }
    return result.rows[0].id;
  }

  async getSongsToPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs 
      JOIN songs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1
      GROUP BY playlistsongs.song_id, songs.id`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song in Playlists not found.');
    }
    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Song failed to be removed from playlists.');
    }
  }

  async verifyPlaylistSongs(playlistId, songId) {
    const query = {
      text: 'SELECT * FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Failed to add, this song is already in use in playlists.');
    }
  }
}

module.exports = PlaylistSongsService;

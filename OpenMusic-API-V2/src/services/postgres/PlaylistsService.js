const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist failed to add.');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users on 
      playlists.owner = users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModel.modelPlaylists);
  }

  async deletePlaylist(playlistId, credentialUserId) {
    await this.verifyPlaylistOwner(playlistId, credentialUserId);
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist failed to delete. Id not found!');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found!');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not entitled to access this resource');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;

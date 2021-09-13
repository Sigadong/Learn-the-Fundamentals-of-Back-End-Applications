const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users on 
      playlists.owner = users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id 
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [userId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;

const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialUserId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist(name, credentialUserId);

    const response = h.response({
      status: 'success',
      message: 'Playlist was successfully added.',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialUserId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialUserId);
    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialUserId } = request.auth.credentials;
    await this._service.deletePlaylist(playlistId, credentialUserId);

    const response = h.response({
      status: 'success',
      message: 'Playlist deleted successfully.',
    });
    return response;
  }
}

module.exports = PlaylistsHandler;

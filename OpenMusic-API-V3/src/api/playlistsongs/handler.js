const autoBind = require('auto-bind');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  async postPlaylistSongsHandler(request, h) {
    const { playlistId, any } = request.params;
    if (any !== 'songs') {
      throw new NotFoundError('This resource is not available!');
    }

    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: credentialUserId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialUserId);
    await this._service.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'The song has been successfully added to the playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { playlistId, any } = request.params;
    if (any !== 'songs') {
      throw new NotFoundError('This resource is not available!');
    }

    const { id: credentialUserId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialUserId);
    const allSong = await this._service.getSongsToPlaylist(playlistId);
    const response = h.response({
      status: 'success',
      data: {
        songs: allSong,
      },
    });
    return response;
  }

  async deletePlaylistSongsHandler(request, h) {
    const { playlistId, any } = request.params;
    if (any !== 'songs') {
      throw new NotFoundError('This resource is not available!');
    }

    this._validator.validatePlaylistSongsPayload(request.payload);
    const { songId } = request.payload;
    const { id: credentialUserId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialUserId);
    await this._service.deleteSongFromPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'The song has been successfully removed from the Playlist.',
    });
    return response;
  }
}

module.exports = PlaylistSongsHandler;

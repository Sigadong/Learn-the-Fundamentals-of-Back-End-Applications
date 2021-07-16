const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;
    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialUserId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialUserId);
    const collabId = await this._collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration was successfully added.',
      data: {
        collaborationId: collabId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialUserId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialUserId);
    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration deleted successfully.',
    });
    return response;
  }
}

module.exports = CollaborationsHandler;

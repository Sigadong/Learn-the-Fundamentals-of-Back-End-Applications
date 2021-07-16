const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, performer, genre, duration } = request.payload;
    const songById = await this._service.addSong({ title, year, performer, genre, duration });

    const response = h.response({
      status: 'success',
      message: 'Song added successfully..',
      data: {
        songId: songById,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler() {
    const allSong = await this._service.getSongs();
    return {
      status: 'success',
      data: {
        songs: allSong.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const songById = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song: songById,
      },
    });
    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const { title, year, performer, genre, duration } = request.payload;
    await this._service.editSongById(id, { title, year, performer, genre, duration });

    const response = h.response({
      status: 'success',
      message: 'Song updated successfully..',
    });
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'The song has been successfully deleted..',
    });
    return response;
  }
}

module.exports = SongsHandler;

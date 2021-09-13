const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUploadPictureHandler(request, h) {
    const { data } = request.payload;
    this._validator.validatePictureHeaders(data.hapi.headers);
    const pictureLocation = await this._service.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        pictureUrl: pictureLocation,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;

const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;
    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);

    const resultAccessToken = this._tokenManager.generateAccessToken({ id });
    const resultRefreshToken = this._tokenManager.generateRefreshToken({ id });
    await this._authenticationsService.addRefreshToken(resultRefreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication was successfully added.',
      data: {
        accessToken: resultAccessToken,
        refreshToken: resultRefreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const resultAccessToken = this._tokenManager.generateAccessToken({ id });
    const response = h.response({
      status: 'success',
      message: 'Access Token successfully updated.',
      data: {
        accessToken: resultAccessToken,
      },
    });
    return response;
  }

  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Refresh token deleted successfully.',
    });
    return response;
  }
}

module.exports = AuthenticationsHandler;

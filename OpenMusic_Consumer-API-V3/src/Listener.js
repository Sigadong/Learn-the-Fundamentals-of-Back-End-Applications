class Listener {
  constructor(PlaylistsService, mailSender) {
    this._PlaylistsService = PlaylistsService;
    this._mailSender = mailSender;
    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { credentialUserId, targetEmail } = JSON.parse(message.content.toString());
      const playlists = await this._PlaylistsService.getPlaylists(credentialUserId);
      const resultMailSender = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlists));
      console.error(resultMailSender);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;

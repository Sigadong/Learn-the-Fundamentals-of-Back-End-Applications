const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const messagePlaylists = {
      from: 'Open Music Apps',
      to: targetEmail,
      subject: 'Export Playlists',
      text: 'The following is attached the export results from the OpenMusic application playlists:',
      attachments: [
        {
          filename: 'playlists.json',
          content,
        },
      ],
    };

    return this._transporter.sendMail(messagePlaylists);
  }
}

module.exports = MailSender;

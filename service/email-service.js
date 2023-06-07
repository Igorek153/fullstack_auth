const nodemailer = require('nodemailer')

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      secure: false,
      auth: {
        user: process.env.SMPT_USER,
        pass: process.env.SMPT_PASSWORD,
      }
    })
  }

  async sendActivationEmail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMPT_USER,
      to,
      subject: 'Active account on' + process.env.API_URL,
      text: '',
      html:
        `
          <div>
            <h1>Для активации перейдтие по ссылке</h1>
            <a href="${link}">${link}</a>
          <div/>
        `
    })
  }
}

module.exports = new EmailService()
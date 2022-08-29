import nodeMailer from 'nodemailer'
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env

interface email {
  subject?: string
  body?: string
}

export default async (toMail: string, data: email) => {
  const transporter = nodeMailer.createTransport({
    host: EMAIL_HOST,
    port: +EMAIL_PORT,
    auth: {
      user: EMAIL_USER, // generated ethereal user
      pass: EMAIL_PASS, // generated ethereal password
    },
  })

  const options = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: toMail, // list of receivers
    subject: data.subject, // Subject line
    text: data.body, // plain text body
    // html: data.html, // html body
  }

  await transporter.sendMail(options)
}

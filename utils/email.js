const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const oAUTH2 = google.auth.OAuth2;
const oAuth2_client = new oAUTH2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET
);
oAuth2_client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
const sendEmail = async (mail) => {
  const accessToken =
    'ya29.a0AVvZVsrQdkR2PL7ObO1LbBTAJGDPBDSXdSa1dfryuKpqevRwEFi520GbDTZ2uYJOfQKMY4fthCo7KO3kNMB9rooi6NiyUx633rzTdGWAmPDfY0xc6dA7A2Aeqe-337yV6GUYR2qehHplAFrdKGvdpq0FlE4maCgYKAVMSARMSFQGbdwaIIN3fhVsnkUBeaZCYxZ9l-w0163';
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: `Vote Poll <${process.env.EMAIL_USER}>`,
    to: mail.email,
    subject: mail.subject,
    text: mail.message,
  };
  console.log(mail.message)
  await transporter.sendMail(mailOptions)
  const mailObj = {
    message: mail.message,
  };
  return mailObj;
};

module.exports = sendEmail;
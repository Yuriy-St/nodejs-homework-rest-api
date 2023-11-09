const nodemailer = require('nodemailer');

const { META_PASSWORD } = process.env;

const config = {
  host: 'smtp.meta.ua',
  port: 465,
  secure: true,
  auth: {
    user: 'yuriystaynov@meta.ua',
    pass: META_PASSWORD,
  },
};

const transport = nodemailer.createTransport(config);

const sendEmail = async data => {
  await transport.sendMail({ ...data, from: 'yuriystaynov@meta.ua' });
};

module.exports = sendEmail;

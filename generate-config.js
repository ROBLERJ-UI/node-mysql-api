const fs = require('fs');

const config = {
  secret: process.env.SECRET,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  smtpOptions: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  emailFrom: process.env.EMAIL_FROM
};

fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
console.log('config.json generated successfully');
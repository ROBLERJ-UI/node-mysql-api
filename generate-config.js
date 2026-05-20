const fs = require('fs');

const envPresence = {
  SECRET: !!process.env.SECRET,
  DB_HOST: !!process.env.DB_HOST,
  DB_PORT: !!process.env.DB_PORT,
  DB_USER: !!process.env.DB_USER,
  DB_PASSWORD: !!process.env.DB_PASSWORD,
  DB_NAME: !!process.env.DB_NAME,
  CORS_ORIGIN: !!process.env.CORS_ORIGIN,
  SMTP_HOST: !!process.env.SMTP_HOST,
  SMTP_PORT: !!process.env.SMTP_PORT,
  SMTP_USER: !!process.env.SMTP_USER,
  SMTP_PASS: !!process.env.SMTP_PASS,
  EMAIL_FROM: !!process.env.EMAIL_FROM
};
console.log('generate-config env present:', envPresence);

const config = {
  secret: process.env.SECRET || 'YOUR_SECRET_HERE',
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'node_mysql_api'
  },
  smtpOptions: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'username',
      pass: process.env.SMTP_PASS || 'password'
    }
  },
  emailFrom: process.env.EMAIL_FROM || 'no-reply@example.com'
};

fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
console.log('config.json generated successfully');
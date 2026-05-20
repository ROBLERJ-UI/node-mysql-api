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

export default config;

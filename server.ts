import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import db, { initialize as initializeDb } from './_helpers/db';
import swaggerRouter from './_helpers/swagger';
import path from 'path';

const app = express();

app.use('/api-docs', swaggerRouter);

app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.sendFile(path.resolve(process.cwd(), 'swagger.yaml'));
});

app.get(['/docs', '/'], (req, res) => {
  res.redirect('/api-docs');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get(['/favicon.ico', '/favicon.png', '/favicon-16x16.png', '/favicon-32x32.png'], (req, res) => {
  res.sendStatus(204);
});

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

let accountsController: any;
app.use('/accounts', async (req, res, next) => {
  if (!accountsController) {
    const mod = await import('./accounts/accounts.controller');
    accountsController = mod.default;
  }

  try {
    await initializeDb();
  } catch (err) {
    return next(err);
  }

  return accountsController(req, res, next);
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    db: db.status
  });
});

app.use(errorHandler);

// Only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => console.log('Server listening on port 4000'));
}

export default app;
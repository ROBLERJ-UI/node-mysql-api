import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import db, { initialize as initializeDb } from './_helpers/db';
import swaggerUi from 'swagger-ui-express';
import swaggerUiDist from 'swagger-ui-dist';
import YAML from 'yamljs';
import path from 'path';

const app = express();
const swaggerDocument = YAML.load(path.resolve(process.cwd(), 'swagger.yaml'));
const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();

app.use('/api-docs', express.static(swaggerUiAssetPath, { index: false }));
app.get(['/api-docs', '/api-docs/'], swaggerUi.setup(swaggerDocument));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get(['/favicon.ico', '/favicon.png', '/favicon-16x16.png', '/favicon-32x32.png'], (req, res) => {
  res.sendStatus(204);
});

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((req, res, next) => {
  if (req.path === '/') return res.redirect('/api-docs/');
  next();
});

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
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import db, { initialize as initializeDb } from './_helpers/db';
import path from 'path';

const app = express();

app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.sendFile(path.resolve(process.cwd(), 'swagger.yaml'));
});

app.get(['/docs', '/api-docs', '/api-docs/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/swagger.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout'
      });
    };
  </script>
</body>
</html>`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get(['/favicon.ico', '/favicon.png', '/favicon-16x16.png', '/favicon-32x32.png'], (req, res) => {
  res.sendStatus(204);
});

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((req, res, next) => {
  if (req.path === '/') return res.redirect('/docs');
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
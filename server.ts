import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import db, { initialize as initializeDb } from './_helpers/db';
import path from 'path';
import YAML from 'yamljs';

const app = express();

// Serve `swagger-ui-dist` assets locally to avoid CDN/edge bot challenges
const swaggerUiAssetPath = path.join(process.cwd(), 'node_modules', 'swagger-ui-dist');
app.use('/api-docs', express.static(swaggerUiAssetPath, { index: false }));

app.get(['/api-docs', '/api-docs/'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Swagger UI</title>
  <link rel="stylesheet" href="/api-docs/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api-docs/swagger-ui-bundle.js"></script>
  <script src="/api-docs/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api-docs/swagger.json',
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

app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.sendFile(path.resolve(process.cwd(), 'swagger.yaml'));
});

// Serve a runtime JSON version of the swagger spec with the server URL set to the current host
app.get('/api-docs/swagger.json', (req, res) => {
  try {
    const swaggerDoc = YAML.load(path.resolve(process.cwd(), 'swagger.yaml'));
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    swaggerDoc.servers = [{ url: hostUrl, description: `${req.get('host')} - ${process.env.NODE_ENV !== 'production' ? 'Local development server' : 'Production server (Vercel)'}` }];
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(swaggerDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load swagger.yaml' });
  }
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
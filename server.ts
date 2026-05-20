import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use((req, res, next) => {
  if (req.path === '/') return res.redirect('/api-docs/');
  next();
});

app.use('/accounts', accountsController);

app.get('/api-docs', swaggerUi.setup(swaggerDocument));
app.get('/api-docs/', swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerUi.serve);

app.use(errorHandler);

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200', 
  credentials: true 
}));

// Only listen locally, NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(4000, () => console.log('Server listening on port 4000'));
}

export default app;
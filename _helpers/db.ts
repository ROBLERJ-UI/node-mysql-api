import config from '../config';
import mysql from 'mysql2/promise';
import * as mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {
  sequelize: null,
  Account: null,
  RefreshToken: null,
  status: {
    connected: false,
    error: null
  },
  _initPromise: null
};

export async function initialize() {
  if (db._initPromise) {
    return db._initPromise;
  }

  db._initPromise = (async () => {
    try {
      const { host, port, user, password, database } = config.database;
      console.log('DB initialize: host=', host, 'port=', port, 'database=', database);

      db.status = { connected: false, error: 'initializing' };

      let connection;
      try {
        connection = await mysql.createConnection({ host, port, user, password, connectTimeout: 5000 });
      } catch (e) {
        console.error('DB initialize failed at mysql.createConnection:', e);
        throw e;
      }

      try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      } catch (e) {
        console.error('DB initialize failed at connection.query(CREATE DATABASE):', e);
        throw e;
      }

      let sequelize;
      try {
        sequelize = new Sequelize(database, user, password, {
          host,
          port,
          dialect: 'mysql',
          dialectModule: mysql2,
          logging: false
        });
      } catch (e) {
        console.error('DB initialize failed constructing Sequelize:', e);
        throw e;
      }

      try {
        db.Account = accountModel(sequelize);
        db.RefreshToken = refreshTokenModel(sequelize);

        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        await sequelize.sync();
        db.sequelize = sequelize;
        db.status = { connected: true, error: null };
        console.log('DB initialized and synced');
      } catch (e) {
        console.error('DB initialize failed during sequelize.sync or model init:', e);
        db.status = { connected: false, error: e && e.message ? e.message : String(e) };
        throw e;
      }

      return db;
    } catch (err) {
      db._initPromise = null;
      console.error('DB initialize error (final):', err && err.stack ? err.stack : err);
      db.status = { connected: false, error: err && err.message ? err.message : String(err) };
      throw err;
    }
  })();

  return db._initPromise;
}

export default db;

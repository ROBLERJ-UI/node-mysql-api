import config from '../config';
import mysql from 'mysql2/promise';
import * as mysql2 from 'mysql2';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

const db: any = {};
export default db;

// initialize but don't let unhandled rejections crash the function; log instead
initialize().catch((err: any) => console.error('DB initialize failed (unhandled):', err));

async function initialize() {
    try {
        const { host, port, user, password, database } = config.database;
        console.log('DB initialize: host=', host, 'port=', port, 'database=', database);

        let connection;
        try {
            connection = await mysql.createConnection({ host, port, user, password });
        } catch (e) {
            console.error('DB initialize failed at mysql.createConnection:', e);
            throw e;
        }

        try {
            // Create DB if it doesn't exist
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        } catch (e) {
            console.error('DB initialize failed at connection.query(CREATE DATABASE):', e);
            throw e;
        }

        // Connect to DB (include host and port so Sequelize doesn't default to localhost)
        let sequelize;
        try {
            sequelize = new Sequelize(database, user, password, { host, port, dialect: 'mysql', dialectModule: mysql2 });
        } catch (e) {
            console.error('DB initialize failed constructing Sequelize:', e);
            throw e;
        }

        try {
            // Init models
            db.Account = accountModel(sequelize);
            db.RefreshToken = refreshTokenModel(sequelize);

            // Define relationships
            db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
            db.RefreshToken.belongsTo(db.Account);

            // Sync models with database
            await sequelize.sync();
            console.log('DB initialized and synced');
        } catch (e) {
            console.error('DB initialize failed during sequelize.sync or model init:', e);
            throw e;
        }
    } catch (err) {
        console.error('DB initialize error (final):', err && err.stack ? err.stack : err);
        // Do not rethrow to avoid crashing serverless function startup
    }
}
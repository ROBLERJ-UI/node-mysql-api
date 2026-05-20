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

        const connection = await mysql.createConnection({ host, port, user, password });

        // Create DB if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

        // Connect to DB
        const sequelize = new Sequelize(database, user, password, { dialect: 'mysql', dialectModule: mysql2 });

        // Init models
        db.Account = accountModel(sequelize);
        db.RefreshToken = refreshTokenModel(sequelize);

        // Define relationships
        db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
        db.RefreshToken.belongsTo(db.Account);

        // Sync models with database
        await sequelize.sync();
        console.log('DB initialized and synced');
    } catch (err) {
        console.error('DB initialize error:', err && err.message ? err.message : err);
        // Do not rethrow to avoid crashing serverless function startup
    }
}
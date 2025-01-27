import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';
import UserModel from './user.model.js';
import BookingModel from './booking.model.js';

const connectWithRetry = async () => {
    const maxRetries = 5;
    let currentTry = 1;

    while (currentTry <= maxRetries) {
        try {
            const sequelize = new Sequelize(dbConfig.DB, dbConfig.USERNAME, dbConfig.PASSWORD, {
                host: dbConfig.HOST,
                dialect: dbConfig.DIALECT,
                port: dbConfig.PORT,
                pool: dbConfig.pool,
                logging: false,
                define: {
                    charset: 'utf8mb4',
                    collate: 'utf8mb4_unicode_ci'
                }
            });

            await sequelize.authenticate();
            console.log('Connection to database has been established successfully.');

            const db = {
                sequelize,
                Sequelize,
                users: UserModel(sequelize, Sequelize),
                bookings: BookingModel(sequelize, Sequelize)
            };

            // Relations
            db.users.hasMany(db.bookings, { as: "bookings" });
            db.bookings.belongsTo(db.users, {
                foreignKey: "uid",
                as: "user",
            });

            return db;
        } catch (error) {
            console.log('Failed to connect to database (attempt ' + currentTry + '/' + maxRetries + '): ' + error.message);
            if (currentTry === maxRetries) {
                throw error;
            }
            currentTry++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default await connectWithRetry();
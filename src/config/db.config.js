import dotenv from 'dotenv';
dotenv.config();

export default {
    DIALECT: 'mysql',
    HOST: process.env.DB_HOST || 'dbbookinghall',
    PORT: process.env.DB_PORT || 3306,
    DB: process.env.DB_NAME || 'bookinghalldb',
    USERNAME: process.env.DB_USERNAME || 'admin',
    PASSWORD: process.env.DB_PASSWORD || '123ABc;#789',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

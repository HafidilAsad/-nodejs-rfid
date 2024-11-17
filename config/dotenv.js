const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT_HF: process.env.PORT_HF,
    SERVER_URL: process.env.SERVER_URL,
    API_KEY: process.env.API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME
};
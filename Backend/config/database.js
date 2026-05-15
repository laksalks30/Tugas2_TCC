const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        dialectOptions: {
            // Untuk beberapa MySQL (tanpa dukungan SSL), hapus/tidak gunakan SSL agar handshake tidak gagal.
            ssl: false,
        },
    }
);

module.exports = sequelize;

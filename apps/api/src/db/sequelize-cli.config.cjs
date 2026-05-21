/* eslint-disable */
// Sequelize CLI config (separate from runtime ORM init).
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });

const url = process.env.DATABASE_URL;
const ssl = process.env.DATABASE_SSL === 'require';

module.exports = {
  development: {
    url,
    dialect: 'postgres',
    dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
  staging: {
    url,
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  },
  production: {
    url,
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  },
};

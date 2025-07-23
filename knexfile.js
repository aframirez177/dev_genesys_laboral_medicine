// knexfile.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'genesys_db'
    },
    migrations: {
      directory: './server/src/database/migrations'
    },
    seeds: {
      directory: './server/src/database/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false } // Usualmente necesario para conexiones a bases de datos en la nube
    },
    migrations: {
      directory: './server/src/database/migrations'
    },
    seeds: {
      directory: './server/src/database/seeds'
    }
  }
}; 
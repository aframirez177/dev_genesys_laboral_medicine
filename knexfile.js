// knexfile.js
// Este archivo leerá las variables de entorno (process.env)
// que son INYECTADAS por docker-compose desde server/.env

const config = {
  development: {
    client: 'pg',
    connection: {
      // Lee las variables del entorno del contenedor
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './server/src/database/migrations',
      extension: 'cjs'
    },
    seeds: {
      directory: './server/src/database/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: {
      // Lee las variables individuales de server/.env
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // ¡Añade la configuración SSL!
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './server/src/database/migrations',
      extension: 'cjs' // <-- Asegúrate que esto también esté
    },
    seeds: {
      directory: './server/src/database/seeds'
    }
  }
};

module.exports = config;
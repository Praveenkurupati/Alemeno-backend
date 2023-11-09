const { Sequelize } = require('sequelize');
require("dotenv").config()

const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const POSTGRES_SERVER = process.env.POSTGRES_SERVER
const POSTGRES_PORT = process.env.POSTGRES_PORT // default postgres port is 5432
const POSTGRES_DB = process.env.POSTGRES_DB

const sequelize = new Sequelize({
    host: 'db', // Hostname should match the service name in your Docker Compose
    port: process.env.POSTGRES_PORT,
    database: POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dialect: 'postgres',
  });
  

module.exports = sequelize
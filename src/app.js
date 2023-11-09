const express = require('express');
const sequelize = require('./Db_connection/config');
const cors = require('cors');
require('dotenv').config();


const app = express();
app.use(cors());

app.use(express.json());

const customerRoutes = require('./Routes/customerRoutes')
const loanRoutes = require('./Routes/loanRoutes')
const UploadFileRoutes = require('./Routes/UploadFileRoutes')

app.use('/',UploadFileRoutes)
app.use('/',customerRoutes)
app.use('/',loanRoutes)


sequelize
  .authenticate()
  .then(() => console.log('DB is connected'))
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });

  (async () => {
    try {
      await sequelize.sync();
      console.log('Sequelize synchronization completed.');
    } catch (error) {
      console.error('Sequelize synchronization failed:', error.message);
    }
  })();

module.exports = app;
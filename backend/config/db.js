const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true',
    define: {
      freezeTableName: true,
    },
  }
)
async function connectWithRetry(retries = 10, delay = 5000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established');
      return sequelize;
    } catch (err) {
      console.error(`Attempt ${i}/${retries} failed: ${err.message}`);
      if (i < retries) {
        console.log(`Waiting ${delay / 1000}s before retrying...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error('🔥 All attempts to connect to the database failed. Exiting.');
        process.exit(1);
      }
    }
  }
}
module.exports = {sequelize,connectWithRetry}

const mysql = require('mysql2');
require('dotenv').config();

const dns = require("dns");

dns.lookup(process.env.DB_HOST, (err, address) => {
  console.log("DB_HOST =", process.env.DB_HOST);
  console.log("DNS Error =", err);
  console.log("Resolved Address =", address);
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT, 
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000 
});

module.exports = pool.promise();

const mysql = require('mysql2');

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // Your MySQL username,
        user: 'root',
        // Your MySQL password
        password: 'Eu180485',
        database: 'company_db'
    },
    console.log('Connected to the company_db database.')
);

module.exports = db;
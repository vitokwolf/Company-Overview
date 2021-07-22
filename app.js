//dependicies 
const db = require('./db/connection');

// connect to database
db.connect(function (err) {
    if (err) throw err
    init()
});


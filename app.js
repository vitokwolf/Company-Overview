//dependicies 
const db = require('./db/connection');
const init = require('./utils/prompts');

// connect to database
db.connect(function (err) {
    if (err) throw err
    init()
});


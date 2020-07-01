const mongoose = require('mongoose');
require('dotenv').config();

const conn = process.env.DB_STRING
 const connection = mongoose.createConnection( conn, {
     useNewUrlParser: true,
     useUnifiedTopology: true
 });


 module.exports = connection;
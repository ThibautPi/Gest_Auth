const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost/APIAuthentification', {useNewUrlParser: true});

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Routes
app.use('/users',require('./routes/users'));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port);
console.log('Server listening at '+port);

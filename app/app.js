const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const contactsRouter = require('../routes/api/contacts');
const authRouter = require('../routes/api/auth');
const invalidUrlError = require('../helpers/invalidUrlError');
const errorHandler = require('../helpers/errorHandler');

const app = express();

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));
app.use('/api/users', authRouter);
app.use('/api/contacts', contactsRouter);
app.use(invalidUrlError);
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');

const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

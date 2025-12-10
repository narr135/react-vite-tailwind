const express = require('express');
require('express-async-errors'); // handles async errors automatically
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json()); // parse JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (should be the last middleware)
app.use(errorHandler);

module.exports = app;
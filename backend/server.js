const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectToDatabase } = require('./config/db');
const collectionRoutes = require('./routes/collectionRoutes');
const queryRoutes = require('./routes/queryRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter);

// Initialize database connection
let db;
(async function initializeApp() {
    db = await connectToDatabase();
    app.locals.db = db;
})();

// Routes
app.use('/api', collectionRoutes);
app.use('/api', queryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
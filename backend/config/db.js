const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Connection Configuration
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10 // Connection pooling for better performance
});

// Parse database name from URI or use default
function getDatabaseName() {
    try {
        // Try to extract the database name from URI
        const uriObject = new URL(uri);
        const pathSegments = uriObject.pathname.split('/');
        const dbNameFromUri = pathSegments.length > 1 ? pathSegments[1] : null;

        // Return the extracted name or default to the environment variable or fallback
        console.log(`Database name extracted from URI: ${dbNameFromUri}`);
        return dbNameFromUri || process.env.MONGODB_DB_NAME;
    } catch (error) {
        // If URI parsing fails, return default
        return process.env.MONGODB_DB_NAME || 'mongodb-explorer';
    }
}

// Connection function
async function connectToDatabase() {
    try {
        await client.connect();
        const dbName = getDatabaseName();
        console.log(`Successfully connected to MongoDB database: ${dbName}`);
        return client.db(dbName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

/**
 * Get a specific collection by name
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>} MongoDB collection instance
 */
async function getCollection(collectionName) {
    const db = await connectToDatabase();
    return db.collection(collectionName);
}

// Export client and connect function
module.exports = {
    connectToDatabase,
    getCollection,
    client
};
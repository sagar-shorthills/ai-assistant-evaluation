// MongoDB service for reusable database operations

/**
 * Gets all collections in the database
 * @param {Object} db - MongoDB database instance
 * @returns {Promise<Array>} - List of collection names
 */
async function getCollections(db) {
    try {
        const collections = await db.listCollections().toArray();
        return collections.map(collection => collection.name);
    } catch (error) {
        console.error('Error fetching collections:', error);
        throw error;
    }
}

/**
 * Gets the fields from a sample document in the collection
 * @param {Object} db - MongoDB database instance
 * @param {String} collectionName - Name of the collection
 * @returns {Promise<Object>} - Fields from the first document
 */
async function getCollectionFields(db, collectionName) {
    try {
        const collection = db.collection(collectionName);
        const sampleDoc = await collection.findOne({});

        if (!sampleDoc) {
            return { error: 'No documents found in collection' };
        }

        return { fields: Object.keys(sampleDoc) };
    } catch (error) {
        console.error(`Error fetching fields for collection \${collectionName}:`, error);
        throw error;
    }
}

/**
 * Executes a query against the specified collection
 * @param {Object} db - MongoDB database instance
 * @param {String} collectionName - Name of the collection
 * @param {Array} selectedFields - Fields to include in results
 * @param {Number} limit - Maximum number of documents to return
 * @returns {Promise<Array>} - Query results
 */
async function executeQuery(db, collectionName, selectedFields, limit = 5) {
    try {
        const collection = db.collection(collectionName);

        // Create projection object for selected fields
        const projection = {};
        if (selectedFields && selectedFields.length > 0) {
            selectedFields.forEach(field => {
                projection[field] = 1;
            });
        }

        // Execute query with projection and limit
        const results = await collection
            .find({})
            .project(projection)
            .limit(parseInt(limit))
            .toArray();

        return results;
    } catch (error) {
        console.error(`Error executing query on collection \${collectionName}:`, error);
        throw error;
    }
}

module.exports = {
    getCollections,
    getCollectionFields,
    executeQuery
};
const { getCollections, getCollectionFields } = require('../services/mongoService');

/**
 * Get all available collections
 */
exports.getAllCollections = async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const collections = await getCollections(db);

        res.status(200).json({
            success: true,
            data: collections
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get fields from a collection
 */
exports.getFields = async (req, res, next) => {
    try {
        const { collection } = req.query;

        if (!collection) {
            return res.status(400).json({
                success: false,
                error: 'Collection name is required'
            });
        }

        const db = req.app.locals.db;
        const result = await getCollectionFields(db, collection);

        if (result.error) {
            return res.status(404).json({
                success: false,
                error: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: result.fields
        });
    } catch (error) {
        next(error);
    }
};
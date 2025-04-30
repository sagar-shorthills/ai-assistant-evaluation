const { executeQuery } = require('../services/mongoService');
const { applyGST } = require('../utils/gstCalculator');
const exportUtils = require('../utils/exportUtils');
const {ObjectId} = require("mongodb");

/**
 * Execute query and return results with optional GST calculation
 */
exports.executeQueryWithGST = async (req, res, next) => {
    try {
        const { collection, fields, limit, gstConfig } = req.body;

        if (!collection) {
            return res.status(400).json({
                success: false,
                error: 'Collection name is required'
            });
        }

        const db = req.app.locals.db;
        let results = await executeQuery(db, collection, fields, limit || 5);

        // Apply GST calculation if GST config is provided
        if (gstConfig && gstConfig.enabled && gstConfig.field && gstConfig.percentage) {
            results = applyGST(results, gstConfig.field, gstConfig.percentage);
        }

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Export data in the requested format
 */
exports.exportData = async (req, res, next) => {
    try {
        const { data, format, filename = 'export' } = req.body;

        if (!data || !Array.isArray(data) || !format) {
            return res.status(400).json({
                success: false,
                error: 'Valid data array and export format are required'
            });
        }

        let result;
        let mimeType;

        switch (format.toLowerCase()) {
            case 'excel':
                result = await exportUtils.exportToExcel(data, filename);
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'csv':
                result = exportUtils.exportToCSV(data, filename);
                mimeType = 'text/csv';
                break;
            case 'json':
                result = JSON.stringify(data, null, 2);
                mimeType = 'application/json';
                break;
            case 'pdf':
                result = await exportUtils.exportToPDF(data, filename);
                mimeType = 'application/pdf';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Unsupported export format'
                });
        }

        res.status(200).json({
            success: true,
            data: result,
            mimeType,
            filename: `${filename}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Generate receipt for a specific record
 */
exports.generateReceipt = async (req, res, next) => {
    console.log('Generating receipt...');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    try {
        const { documentId, collection } = req.params;
        const { gstConfig } = req.body;

        if (!documentId || !collection) {
            return res.status(400).json({
                success: false,
                error: 'Document ID and collection name are required'
            });
        }

        const db = req.app.locals.db;
        const coll = db.collection(collection);

        // Try to convert to ObjectId if it follows the format
        let query = { _id: new ObjectId(documentId) };
        console.log('Query:', query);

        const document = await coll.findOne(query);
        console.log('Document:', document);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Calculate GST if config provided
        let documentWithGST = { ...document };
        if (gstConfig && gstConfig.enabled && gstConfig.field && gstConfig.percentage) {
            const fieldValue = parseFloat(document[gstConfig.field]);
            const gstAmount = (fieldValue * gstConfig.percentage / 100);

            documentWithGST = {
                ...documentWithGST,
                'GST Percentage': gstConfig.percentage,
                'GST Amount': parseFloat(gstAmount.toFixed(2)),
                'Total Amount': parseFloat((fieldValue + gstAmount).toFixed(2))
            };
        }

        // Generate PDF receipt
        const pdfBuffer = await exportUtils.generateReceipt(documentWithGST);

        res.status(200).json({
            success: true,
            data: pdfBuffer,
            mimeType: 'application/pdf',
            filename: `receipt-${documentId}.pdf`
        });
    } catch (error) {
        next(error);
    }
};
const gstrService = require('../services/gstrService');

/**
 * Generate a GSTR-3B report for a specific company, year, and month
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.generateGstr3bReport = async (req, res, next) => {
    try {
        const { companyId, year, month, format = 'json' } = req.body;

        if (!companyId || !year || !month) {
            return res.status(400).json({
                success: false,
                error: 'Company ID, year, and month are required'
            });
        }

        // Validate year and month
        const yearNum = parseInt(year, 10);
        const monthNum = parseInt(month, 10);

        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            return res.status(400).json({
                success: false,
                error: 'Invalid year format'
            });
        }

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid month format (should be 1-12)'
            });
        }

        // Generate the GSTR-3B report
        const reportData = await gstrService.generateGstr3bReport(companyId, yearNum, monthNum);

        // Return as requested format (json or pdf)
        if (format.toLowerCase() === 'pdf') {
            const pdfBuffer = await gstrService.generateGstr3bPdf(reportData);

            // Convert buffer to base64 string to match old behavior
            const pdfBase64 = pdfBuffer.toString('base64');

            return res.status(200).json({
                success: true,
                data: pdfBase64,
                mimeType: 'application/pdf',
                filename: `GSTR3B_${companyId}_${year}_${month}.pdf`
            });
        }

        // Default to JSON
        return res.status(200).json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Error generating GSTR-3B report:', error);
        next(error);
    }
};
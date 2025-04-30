/**
 * Calculate GST amount based on field value and GST percentage
 * @param {Number} fieldValue - The value to apply GST on
 * @param {Number} gstPercentage - GST percentage (5, 12, 18, 28)
 * @returns {Number} - Calculated GST amount
 */
function calculateGST(fieldValue, gstPercentage) {
    if (typeof fieldValue !== 'number' || isNaN(fieldValue)) {
        return 0;
    }

    // GST calculation formula
    return parseFloat((fieldValue * gstPercentage / 100).toFixed(2));
}

/**
 * Apply GST calculation to query results
 * @param {Array} results - Query results from MongoDB
 * @param {String} gstField - Field name to apply GST on
 * @param {Number} gstPercentage - GST percentage (5, 12, 18, 28)
 * @returns {Array} - Results with GST amount added
 */
function applyGST(results, gstField, gstPercentage) {
    if (!results || !Array.isArray(results) || !gstField || !gstPercentage) {
        return results;
    }

    return results.map(item => {
        const fieldValue = parseFloat(item[gstField]);
        const gstAmount = calculateGST(fieldValue, gstPercentage);

        return {
            ...item,
            'GST Amount': gstAmount,
            'Total Amount': parseFloat((fieldValue + gstAmount).toFixed(2))
        };
    });
}

module.exports = {
    calculateGST,
    applyGST
};

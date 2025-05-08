// services/gstrService.js
const { getCollection } = require('../config/db');
const { jsPDF } = require('jspdf');
require('jspdf-autotable'); // This adds autoTable method to jsPDF prototype

/**
 * Generate GSTR-3B report data for a specific company, year, and month
 * @param {string} companyId - Company ID
 * @param {number} year - Report year
 * @param {number} month - Report month (1-12)
 * @returns {Object} GSTR-3B report data
 */
exports.generateGstr3bReport = async (companyId, year, month) => {
    try {
        // Get required collections
        const transactionsCollection = await getCollection('transactions');
        const companiesCollection = await getCollection('companies');

        // Get company information
        // const company = await companiesCollection.findOne({ _id: companyId });
        // if (!company) {
        //     throw new Error(`Company with ID ${companyId} not found`);
        // }

        // Calculate date range for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        // Find all transactions for the company in the specified month
        const transactions = await transactionsCollection.find({
            companyId,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).toArray();

        // Initialize report structure
        const report = {
            header: {
                gstin: "Some",
                legalName: "ABC Entity",
                tradeName: "ABC Entity",
                period: {
                    month,
                    year
                }
            },
            section3_1: {
                // Outward taxable supplies (other than zero rated, nil rated and exempted)
                outward_taxable: calculateOutwardTaxable(transactions),
                // Outward taxable supplies (zero rated)
                outward_zero: calculateOutwardZeroRated(transactions),
                // Other outward supplies (nil rated, exempted)
                outward_nil_exempt: calculateOutwardNilExempt(transactions),
                // Inward supplies (liable to reverse charge)
                inward_reverse_charge: calculateInwardReverseCharge(transactions),
                // Non-GST outward supplies
                non_gst_outward: calculateNonGstOutward(transactions)
            },
            section4: {
                // ITC details - eligible, reversed, net
                itc: calculateITC(transactions)
            },
            section5: {
                // Exempt, nil-rated and non-GST inward supplies
                exempt_nil_non_gst: calculateExemptNilNonGst(transactions)
            },
            section6: {
                // Tax payment details
                payment: calculatePayment(transactions)
            }
        };

        return report;
    } catch (error) {
        console.error('Error generating GSTR-3B report:', error);
        throw error;
    }
};

/**
 * Calculate outward taxable supplies (other than zero rated, nil rated and exempted)
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateOutwardTaxable(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        cess: 0
    };

    // Filter and process outward taxable transactions
    const outwardTaxable = transactions.filter(tx =>
        tx.type === 'outward' &&
        tx.subType === 'taxable' &&
        tx.gstType !== 'zero_rated' &&
        tx.gstType !== 'nil_rated' &&
        tx.gstType !== 'exempted'
    );

    // Calculate totals
    outwardTaxable.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.igst += tx.igst || 0;
        result.cgst += tx.cgst || 0;
        result.sgst += tx.sgst || 0;
        result.cess += tx.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        igst: parseFloat(result.igst.toFixed(2)),
        cgst: parseFloat(result.cgst.toFixed(2)),
        sgst: parseFloat(result.sgst.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate outward zero rated supplies
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateOutwardZeroRated(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        igst: 0,
        cess: 0
    };

    // Filter and process outward zero rated transactions
    const outwardZero = transactions.filter(tx =>
        tx.type === 'outward' &&
        tx.gstType === 'zero_rated'
    );

    // Calculate totals
    outwardZero.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.igst += tx.igst || 0;
        result.cess += tx.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        igst: parseFloat(result.igst.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate outward nil-rated and exempted supplies
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateOutwardNilExempt(transactions) {
    // Filter and process outward nil-rated and exempted transactions
    const outwardNilExempt = transactions.filter(tx =>
        tx.type === 'outward' &&
        (tx.gstType === 'nil_rated' || tx.gstType === 'exempted')
    );

    // Calculate total taxable value
    const taxableValue = outwardNilExempt.reduce((total, tx) =>
        total + (tx.taxableValue || 0), 0);

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(taxableValue.toFixed(2))
    };
}

/**
 * Calculate inward supplies liable to reverse charge
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateInwardReverseCharge(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        igst: 0,
        cgst: 0,
        sgst: 0,
        cess: 0
    };

    // Filter and process inward reverse charge transactions
    const inwardRC = transactions.filter(tx =>
        tx.type === 'inward' &&
        tx.reverseCharge === true
    );

    // Calculate totals
    inwardRC.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.igst += tx.igst || 0;
        result.cgst += tx.cgst || 0;
        result.sgst += tx.sgst || 0;
        result.cess += tx.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        igst: parseFloat(result.igst.toFixed(2)),
        cgst: parseFloat(result.cgst.toFixed(2)),
        sgst: parseFloat(result.sgst.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate non-GST outward supplies
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateNonGstOutward(transactions) {
    // Filter and process non-GST outward transactions
    const nonGstOutward = transactions.filter(tx =>
        tx.type === 'outward' &&
        tx.gstType === 'non_gst'
    );

    // Calculate total taxable value
    const taxableValue = nonGstOutward.reduce((total, tx) =>
        total + (tx.taxableValue || 0), 0);

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(taxableValue.toFixed(2))
    };
}

/**
 * Calculate Input Tax Credit (ITC) details
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated ITC values
 */
function calculateITC(transactions) {
    // Initialize result structure
    const result = {
        eligible: {
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0
        },
        reversed: {
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0
        },
        net: {
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0
        }
    };

    // Process ITC eligible transactions
    transactions.forEach(tx => {
        if (tx.itc && tx.itc.eligible) {
            result.eligible.igst += tx.itc.eligible.igst || 0;
            result.eligible.cgst += tx.itc.eligible.cgst || 0;
            result.eligible.sgst += tx.itc.eligible.sgst || 0;
            result.eligible.cess += tx.itc.eligible.cess || 0;
        }

        if (tx.itc && tx.itc.reversed) {
            result.reversed.igst += tx.itc.reversed.igst || 0;
            result.reversed.cgst += tx.itc.reversed.cgst || 0;
            result.reversed.sgst += tx.itc.reversed.sgst || 0;
            result.reversed.cess += tx.itc.reversed.cess || 0;
        }
    });

    // Calculate net ITC
    result.net.igst = result.eligible.igst - result.reversed.igst;
    result.net.cgst = result.eligible.cgst - result.reversed.cgst;
    result.net.sgst = result.eligible.sgst - result.reversed.sgst;
    result.net.cess = result.eligible.cess - result.reversed.cess;

    // Round all values to 2 decimal places
    Object.keys(result).forEach(category => {
        Object.keys(result[category]).forEach(tax => {
            result[category][tax] = parseFloat(result[category][tax].toFixed(2));
        });
    });

    return result;
}

/**
 * Calculate exempt, nil-rated and non-GST inward supplies
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateExemptNilNonGst(transactions) {
    // Initialize result structure
    const result = {
        interstate: 0,
        intrastate: 0
    };

    // Filter and process relevant transactions
    const filteredTxs = transactions.filter(tx =>
        tx.type === 'inward' &&
        (tx.gstType === 'nil_rated' || tx.gstType === 'exempted' || tx.gstType === 'non_gst')
    );

    // Calculate totals based on supply type
    filteredTxs.forEach(tx => {
        if (tx.supplyType === 'interstate') {
            result.interstate += tx.taxableValue || 0;
        } else if (tx.supplyType === 'intrastate') {
            result.intrastate += tx.taxableValue || 0;
        }
    });

    // Round to 2 decimal places
    return {
        interstate: parseFloat(result.interstate.toFixed(2)),
        intrastate: parseFloat(result.intrastate.toFixed(2))
    };
}

/**
 * Calculate tax payment details
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated tax payment values
 */
function calculatePayment(transactions) {
    // Initialize result structure
    const result = {
        tax: {
            igst: { cash: 0, itc: 0 },
            cgst: { cash: 0, itc: 0 },
            sgst: { cash: 0, itc: 0 },
            cess: { cash: 0, itc: 0 }
        },
        interest: {
            igst: 0,
            cgst: 0,
            sgst: 0,
            cess: 0
        },
        lateFee: {
            cgst: 0,
            sgst: 0
        }
    };

    // Filter payment transactions
    const payments = transactions.filter(tx => tx.type === 'payment');

    // Process each payment
    payments.forEach(payment => {
        if (payment.paymentDetails) {
            // Process tax payments
            if (payment.paymentDetails.tax) {
                const tax = payment.paymentDetails.tax;

                // IGST
                if (tax.igst) {
                    result.tax.igst.cash += tax.igst.cash || 0;
                    result.tax.igst.itc += tax.igst.itc || 0;
                }

                // CGST
                if (tax.cgst) {
                    result.tax.cgst.cash += tax.cgst.cash || 0;
                    result.tax.cgst.itc += tax.cgst.itc || 0;
                }

                // SGST
                if (tax.sgst) {
                    result.tax.sgst.cash += tax.sgst.cash || 0;
                    result.tax.sgst.itc += tax.sgst.itc || 0;
                }

                // CESS
                if (tax.cess) {
                    result.tax.cess.cash += tax.cess.cash || 0;
                    result.tax.cess.itc += tax.cess.itc || 0;
                }
            }

            // Process interest payments
            if (payment.paymentDetails.interest) {
                const interest = payment.paymentDetails.interest;
                result.interest.igst += interest.igst || 0;
                result.interest.cgst += interest.cgst || 0;
                result.interest.sgst += interest.sgst || 0;
                result.interest.cess += interest.cess || 0;
            }

            // Process late fee payments
            if (payment.paymentDetails.lateFee) {
                const lateFee = payment.paymentDetails.lateFee;
                result.lateFee.cgst += lateFee.cgst || 0;
                result.lateFee.sgst += lateFee.sgst || 0;
            }
        }
    });

    // Round all values to 2 decimal places
    Object.keys(result).forEach(category => {
        Object.keys(result[category]).forEach(tax => {
            if (typeof result[category][tax] === 'object') {
                Object.keys(result[category][tax]).forEach(method => {
                    result[category][tax][method] = parseFloat(result[category][tax][method].toFixed(2));
                });
            } else {
                result[category][tax] = parseFloat(result[category][tax].toFixed(2));
            }
        });
    });

    return result;
}

/**
 * Generate PDF for GSTR-3B report
 * @param {Object} reportData - GSTR-3B report data
 * @returns {Buffer} PDF buffer
 */
exports.generateGstr3bPdf = async (reportData) => {
    try {
        // Create a new PDF document
        const doc = new jsPDF();

        // Add title and header information
        doc.setFontSize(16);
        doc.text('GSTR-3B Report', 14, 22);

        doc.setFontSize(10);
        doc.text(`GSTIN: ${reportData.header.gstin}`, 14, 30);
        doc.text(`Legal Name: ${reportData.header.legalName}`, 14, 35);
        doc.text(`Trade Name: ${reportData.header.tradeName || 'N/A'}`, 14, 40);
        doc.text(`Period: ${reportData.header.period.month}/${reportData.header.period.year}`, 14, 45);

        // Section 3.1 - Outward and inward supplies
        doc.setFontSize(12);
        doc.text('3.1 Outward and inward supplies', 14, 55);

        // Table for section 3.1
        const section31Headers = ['Nature of Supplies', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section31Data = [
            ['(a) Outward taxable supplies',
                reportData.section3_1.outward_taxable.taxableValue,
                reportData.section3_1.outward_taxable.igst,
                reportData.section3_1.outward_taxable.cgst,
                reportData.section3_1.outward_taxable.sgst,
                reportData.section3_1.outward_taxable.cess],
            ['(b) Outward taxable supplies (zero rated)',
                reportData.section3_1.outward_zero.taxableValue,
                reportData.section3_1.outward_zero.igst,
                reportData.section3_1.outward_zero.cess,
                '',
                ''],
            ['(c) Other outward supplies (Nil rated, exempted)',
                reportData.section3_1.outward_nil_exempt.taxableValue,
                '',
                '',
                '',
                ''],
            ['(d) Inward supplies (liable to reverse charge)',
                reportData.section3_1.inward_reverse_charge.taxableValue,
                reportData.section3_1.inward_reverse_charge.igst,
                reportData.section3_1.inward_reverse_charge.cgst,
                reportData.section3_1.inward_reverse_charge.sgst,
                reportData.section3_1.inward_reverse_charge.cess],
            ['(e) Non-GST outward supplies',
                reportData.section3_1.non_gst_outward.taxableValue,
                '',
                '',
                '',
                '']
        ];

        doc.autoTable({
            head: [section31Headers],
            body: section31Data,
            startY: 60,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 4 - Input Tax Credit (ITC)
        doc.setFontSize(12);
        let currentY = doc.lastAutoTable.finalY + 10;
        doc.text('4. Input Tax Credit (ITC)', 14, currentY);

        // Table for section 4
        const section4Headers = ['Details', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section4Data = [
            ['(A) ITC Available (eligible)',
                reportData.section4.itc.eligible.igst,
                reportData.section4.itc.eligible.cgst,
                reportData.section4.itc.eligible.sgst,
                reportData.section4.itc.eligible.cess],
            ['(B) ITC Reversed',
                reportData.section4.itc.reversed.igst,
                reportData.section4.itc.reversed.cgst,
                reportData.section4.itc.reversed.sgst,
                reportData.section4.itc.reversed.cess],
            ['(C) Net ITC Available (A-B)',
                reportData.section4.itc.net.igst,
                reportData.section4.itc.net.cgst,
                reportData.section4.itc.net.sgst,
                reportData.section4.itc.net.cess]
        ];

        doc.autoTable({
            head: [section4Headers],
            body: section4Data,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 5 - Exempt, nil-rated and non-GST inward supplies
        doc.setFontSize(12);
        currentY = doc.lastAutoTable.finalY + 10;
        doc.text('5. Exempt, nil-rated and non-GST inward supplies', 14, currentY);

        // Table for section 5
        const section5Headers = ['Nature of supplies', 'Inter-State supplies', 'Intra-State supplies'];

        const section5Data = [
            ['Exempt, nil-rated and non-GST inward supplies',
                reportData.section5.exempt_nil_non_gst.interstate,
                reportData.section5.exempt_nil_non_gst.intrastate]
        ];

        doc.autoTable({
            head: [section5Headers],
            body: section5Data,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 6 - Tax Payment details
        doc.setFontSize(12);
        currentY = doc.lastAutoTable.finalY + 10;
        doc.text('6. Payment of tax', 14, currentY);

        // Table for tax payment
        const section6TaxHeaders = ['Description', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section6TaxData = [
            ['(a) Tax paid through Cash',
                reportData.section6.payment.tax.igst.cash,
                reportData.section6.payment.tax.cgst.cash,
                reportData.section6.payment.tax.sgst.cash,
                reportData.section6.payment.tax.cess.cash],
            ['(b) Tax paid through ITC',
                reportData.section6.payment.tax.igst.itc,
                reportData.section6.payment.tax.cgst.itc,
                reportData.section6.payment.tax.sgst.itc,
                reportData.section6.payment.tax.cess.itc]
        ];

        doc.autoTable({
            head: [section6TaxHeaders],
            body: section6TaxData,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Table for interest and late fee
        const section6OtherHeaders = ['Description', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section6OtherData = [
            ['(c) Interest',
                reportData.section6.payment.interest.igst,
                reportData.section6.payment.interest.cgst,
                reportData.section6.payment.interest.sgst,
                reportData.section6.payment.interest.cess],
            ['(d) Late Fee',
                '',
                reportData.section6.payment.lateFee.cgst,
                reportData.section6.payment.lateFee.sgst,
                '']
        ];

        doc.autoTable({
            head: [section6OtherHeaders],
            body: section6OtherData,
            startY: doc.lastAutoTable.finalY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        }

        // Return the PDF as a buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating GSTR-3B PDF:', error);
        throw error;
    }
};

/**
 * Get transaction summary for a specific company and period
 * @param {string} companyId - Company ID
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Object} Transaction summary
 */
exports.getTransactionSummary = async (companyId, year, month) => {
    try {
        // Get transactions collection
        const transactionsCollection = await getCollection('transactions');

        // Calculate date range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        // Aggregate pipeline to get summary
        const pipeline = [
            {
                $match: {
                    companyId,
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        type: "$type",
                        gstType: "$gstType"
                    },
                    count: { $sum: 1 },
                    totalTaxableValue: { $sum: "$taxableValue" },
                    totalIgst: { $sum: "$igst" },
                    totalCgst: { $sum: "$cgst" },
                    totalSgst: { $sum: "$sgst" },
                    totalCess: { $sum: "$cess" }
                }
            },
            {
                $group: {
                    _id: "$_id.type",
                    details: {
                        $push: {
                            gstType: "$_id.gstType",
                            count: "$count",
                            taxableValue: "$totalTaxableValue",
                            igst: "$totalIgst",
                            cgst: "$totalCgst",
                            sgst: "$totalSgst",
                            cess: "$totalCess"
                        }
                    },
                    totalCount: { $sum: "$count" },
                    totalTaxableValue: { $sum: "$totalTaxableValue" }
                }
            }
        ];

        const summary = await transactionsCollection.aggregate(pipeline).toArray();

        return {
            period: {
                month,
                year
            },
            summary
        };
    } catch (error) {
        console.error('Error getting transaction summary:', error);
        throw error;
    }
};

/**
 * Calculate total tax liability for the period (outward - ITC)
 * @param {Object} reportData - GSTR-3B report data
 * @returns {Object} Net tax liability
 */
exports.calculateNetLiability = (reportData) => {
    // Calculate total output tax
    const outputTax = {
        igst: reportData.section3_1.outward_taxable.igst +
            reportData.section3_1.outward_zero.igst +
            reportData.section3_1.inward_reverse_charge.igst,
        cgst: reportData.section3_1.outward_taxable.cgst +
            reportData.section3_1.inward_reverse_charge.cgst,
        sgst: reportData.section3_1.outward_taxable.sgst +
            reportData.section3_1.inward_reverse_charge.sgst,
        cess: reportData.section3_1.outward_taxable.cess +
            reportData.section3_1.outward_zero.cess +
            reportData.section3_1.inward_reverse_charge.cess
    };

    // Get net ITC
    const netITC = reportData.section4.itc.net;

    // Calculate net tax liability (Output Tax - ITC)
    const netLiability = {
        igst: Math.max(0, outputTax.igst - netITC.igst),
        cgst: Math.max(0, outputTax.cgst - netITC.cgst),
        sgst: Math.max(0, outputTax.sgst - netITC.sgst),
        cess: Math.max(0, outputTax.cess - netITC.cess),
    };

    // Calculate total liability
    const totalLiability =
        netLiability.igst +
        netLiability.cgst +
        netLiability.sgst +
        netLiability.cess;

    return {
        outputTax,
        netITC,
        netLiability,
        totalLiability: parseFloat(totalLiability.toFixed(2))
    };
};
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
        const supplyTransactionsCollection = await getCollection('supply_transactions');
        const itcPaymentsCollection = await getCollection('itc_payments');
        const companiesCollection = await getCollection('companies');

        // Get company information
        const company = await companiesCollection.findOne({ _id: companyId });
        if (!company) {
            throw new Error(`Company with ID ${companyId} not found`);
        }

        // Find all supply transactions for the company in the specified month
        const supplyTransactions = await supplyTransactionsCollection.find({
            companyId,
            period: {
                year,
                month
            }
        }).toArray();

        // Find all ITC payments for the company in the specified month
        const itcPayments = await itcPaymentsCollection.find({
            companyId,
            period: {
                year,
                month
            }
        }).toArray();

        // Initialize report structure
        const report = {
            header: {
                gstin: company.gstin,
                legalName: company.legalName,
                tradeName: company.tradeName,
                period: {
                    month,
                    year
                },
                arn: "BB29DJFN3859",
                arnDate: "08/05/2025",
                authorizedSignatory: company.authorizedSignatory
            },
            section3_1: {
                // Outward taxable supplies (other than zero rated, nil rated and exempted)
                outward_taxable: calculateOutwardTaxable(supplyTransactions),
                // Outward taxable supplies (zero rated)
                outward_zero: calculateOutwardZeroRated(supplyTransactions),
                // Other outward supplies (nil rated, exempted)
                outward_nil_exempt: calculateOutwardNilExempt(supplyTransactions),
                // Inward supplies (liable to reverse charge)
                inward_reverse_charge: calculateInwardReverseCharge(supplyTransactions),
                // Non-GST outward supplies
                non_gst_outward: calculateNonGstOutward(supplyTransactions)
            },
            section3_1_1: {
                // Details regarding section 9(5) supplies
                ecommerce_operator: calculateEcommerceOperatorSupplies(supplyTransactions)
            },
            section3_2: {
                // Inter-state supplies
                unregistered: calculateInterstateUnregistered(supplyTransactions),
                composition: calculateInterstateComposition(supplyTransactions),
                uin: calculateInterstateUIN(supplyTransactions)
            },
            section4: {
                // ITC details - eligible, reversed, net
                itc: calculateITC(supplyTransactions, itcPayments)
            },
            section5: {
                // Exempt, nil-rated and non-GST inward supplies
                exempt_nil_non_gst: calculateExemptNilNonGst(supplyTransactions)
            },
            section5_1: {
                // Interest and Late Fees
                interest: calculateInterest(itcPayments),
                lateFee: calculateLateFee(itcPayments)
            },
            section6: {
                // Tax payment details
                payment: calculatePayment(supplyTransactions, itcPayments)
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
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process outward taxable transactions
    const outwardTaxable = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'TAXABLE'
    );

    // Calculate totals
    outwardTaxable.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
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
        integrated: 0,
        cess: 0
    };

    // Filter and process outward zero rated transactions
    const outwardZero = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'ZERO_RATED'
    );

    // Calculate totals
    outwardZero.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
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
        tx.type === 'OUTWARD' &&
        tx.subType === 'EXEMPT'
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
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process inward reverse charge transactions
    const inwardRC = transactions.filter(tx =>
        tx.type === 'INWARD' &&
        tx.subType === 'RCM'
    );

    // Calculate totals
    inwardRC.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
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
        tx.type === 'OUTWARD' &&
        tx.subType === 'NON_GST'
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
 * Calculate e-commerce operator supplies
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateEcommerceOperatorSupplies(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process e-commerce operator transactions
    const ecommerceTxs = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'TAXABLE' &&
        tx.isEcommerceOperator === true
    );

    // Calculate totals
    ecommerceTxs.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate inter-state supplies to unregistered persons
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateInterstateUnregistered(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process inter-state unregistered transactions
    const unregisteredTxs = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'TAXABLE' &&
        tx.counterparty.isRegistered === false &&
        tx.isInterstate === true
    );

    // Calculate totals
    unregisteredTxs.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate inter-state supplies to composition taxable persons
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateInterstateComposition(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process inter-state composition transactions
    const compositionTxs = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'TAXABLE' &&
        tx.counterparty.isComposition === true &&
        tx.isInterstate === true
    );

    // Calculate totals
    compositionTxs.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate inter-state supplies to UIN holders
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Calculated values
 */
function calculateInterstateUIN(transactions) {
    // Initialize result structure
    const result = {
        taxableValue: 0,
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Filter and process inter-state UIN transactions
    const uinTxs = transactions.filter(tx =>
        tx.type === 'OUTWARD' &&
        tx.subType === 'TAXABLE' &&
        tx.counterparty.isUIN === true &&
        tx.isInterstate === true
    );

    // Calculate totals
    uinTxs.forEach(tx => {
        result.taxableValue += tx.taxableValue || 0;
        result.integrated += tx.tax.integrated || 0;
        result.central += tx.tax.central || 0;
        result.state += tx.tax.state || 0;
        result.cess += tx.tax.cess || 0;
    });

    // Round to 2 decimal places
    return {
        taxableValue: parseFloat(result.taxableValue.toFixed(2)),
        integrated: parseFloat(result.integrated.toFixed(2)),
        central: parseFloat(result.central.toFixed(2)),
        state: parseFloat(result.state.toFixed(2)),
        cess: parseFloat(result.cess.toFixed(2))
    };
}

/**
 * Calculate Input Tax Credit (ITC) details
 * @param {Array} supplyTransactions - Array of supply transaction objects
 * @param {Array} itcPayments - Array of ITC payment objects
 * @returns {Object} Calculated ITC values
 */
function calculateITC(supplyTransactions, itcPayments) {
    // Initialize result structure
    const result = {
        eligible: {
            import_goods: { integrated: 0, central: 0, state: 0, cess: 0 },
            import_services: { integrated: 0, central: 0, state: 0, cess: 0 },
            reverse_charge: { integrated: 0, central: 0, state: 0, cess: 0 },
            isd: { integrated: 0, central: 0, state: 0, cess: 0 },
            others: { integrated: 0, central: 0, state: 0, cess: 0 }
        },
        reversed: {
            rules_38_42_43: { integrated: 0, central: 0, state: 0, cess: 0 },
            others: { integrated: 0, central: 0, state: 0, cess: 0 }
        },
        net: {
            integrated: 0,
            central: 0,
            state: 0,
            cess: 0
        }
    };

    // Process ITC eligible transactions
    supplyTransactions.forEach(tx => {
        if (tx.itc && tx.itc.eligible) {
            const category = tx.itc.category || 'others';
            result.eligible[category].integrated += tx.itc.amount.integrated || 0;
            result.eligible[category].central += tx.itc.amount.central || 0;
            result.eligible[category].state += tx.itc.amount.state || 0;
            result.eligible[category].cess += tx.itc.amount.cess || 0;
        }

        if (tx.itc && tx.itc.reversed) {
            const category = tx.itc.reversalCategory || 'others';
            result.reversed[category].integrated += tx.itc.amount.integrated || 0;
            result.reversed[category].central += tx.itc.amount.central || 0;
            result.reversed[category].state += tx.itc.amount.state || 0;
            result.reversed[category].cess += tx.itc.amount.cess || 0;
        }
    });

    // Calculate net ITC
    result.net.integrated = 
        Object.values(result.eligible).reduce((sum, cat) => sum + cat.integrated, 0) -
        Object.values(result.reversed).reduce((sum, cat) => sum + cat.integrated, 0);
    
    result.net.central = 
        Object.values(result.eligible).reduce((sum, cat) => sum + cat.central, 0) -
        Object.values(result.reversed).reduce((sum, cat) => sum + cat.central, 0);
    
    result.net.state = 
        Object.values(result.eligible).reduce((sum, cat) => sum + cat.state, 0) -
        Object.values(result.reversed).reduce((sum, cat) => sum + cat.state, 0);
    
    result.net.cess = 
        Object.values(result.eligible).reduce((sum, cat) => sum + cat.cess, 0) -
        Object.values(result.reversed).reduce((sum, cat) => sum + cat.cess, 0);

    // Round all values to 2 decimal places
    Object.keys(result).forEach(category => {
        if (category === 'net') {
            Object.keys(result[category]).forEach(tax => {
                result[category][tax] = parseFloat(result[category][tax].toFixed(2));
            });
        } else {
            Object.keys(result[category]).forEach(subCategory => {
                Object.keys(result[category][subCategory]).forEach(tax => {
                    result[category][subCategory][tax] = parseFloat(result[category][subCategory][tax].toFixed(2));
                });
            });
        }
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
        composition: { interstate: 0, intrastate: 0 },
        exempt: { interstate: 0, intrastate: 0 },
        nil_rated: { interstate: 0, intrastate: 0 },
        non_gst: { interstate: 0, intrastate: 0 }
    };

    // Filter and process relevant transactions
    const filteredTxs = transactions.filter(tx =>
        tx.type === 'INWARD' &&
        (tx.subType === 'EXEMPT' || tx.subType === 'NIL_RATED' || tx.subType === 'NON_GST')
    );

    // Calculate totals based on supply type
    filteredTxs.forEach(tx => {
        const category = tx.subType.toLowerCase();
        if (tx.isInterstate) {
            result[category].interstate += tx.taxableValue || 0;
        } else {
            result[category].intrastate += tx.taxableValue || 0;
        }
    });

    // Round to 2 decimal places
    Object.keys(result).forEach(category => {
        Object.keys(result[category]).forEach(type => {
            result[category][type] = parseFloat(result[category][type].toFixed(2));
        });
    });

    return result;
}

/**
 * Calculate interest
 * @param {Array} itcPayments - Array of ITC payment objects
 * @returns {Object} Calculated interest values
 */
function calculateInterest(itcPayments) {
    // Initialize result structure
    const result = {
        computed: { integrated: 0, central: 0, state: 0, cess: 0 },
        paid: { integrated: 0, central: 0, state: 0, cess: 0 }
    };

    // Process interest payments
    itcPayments.forEach(payment => {
        if (payment.payment.interest) {
            result.paid.integrated += payment.payment.interest.integrated || 0;
            result.paid.central += payment.payment.interest.central || 0;
            result.paid.state += payment.payment.interest.state || 0;
            result.paid.cess += payment.payment.interest.cess || 0;
        }
    });

    // Round to 2 decimal places
    Object.keys(result).forEach(category => {
        Object.keys(result[category]).forEach(tax => {
            result[category][tax] = parseFloat(result[category][tax].toFixed(2));
        });
    });

    return result;
}

/**
 * Calculate late fee
 * @param {Array} itcPayments - Array of ITC payment objects
 * @returns {Object} Calculated late fee values
 */
function calculateLateFee(itcPayments) {
    // Initialize result structure
    const result = {
        integrated: 0,
        central: 0,
        state: 0,
        cess: 0
    };

    // Process late fee payments
    itcPayments.forEach(payment => {
        if (payment.payment.lateFee) {
            result.integrated += payment.payment.lateFee.integrated || 0;
            result.central += payment.payment.lateFee.central || 0;
            result.state += payment.payment.lateFee.state || 0;
            result.cess += payment.payment.lateFee.cess || 0;
        }
    });

    // Round to 2 decimal places
    Object.keys(result).forEach(tax => {
        result[tax] = parseFloat(result[tax].toFixed(2));
    });

    return result;
}

/**
 * Calculate tax payment details
 * @param {Array} supplyTransactions - Array of supply transaction objects
 * @param {Array} itcPayments - Array of ITC payment objects
 * @returns {Object} Calculated tax payment values
 */
function calculatePayment(supplyTransactions, itcPayments) {
    // Initialize result structure
    const result = {
        tax: {
            integrated: { cash: 0, itc: 0 },
            central: { cash: 0, itc: 0 },
            state: { cash: 0, itc: 0 },
            cess: { cash: 0, itc: 0 }
        },
        interest: {
            integrated: 0,
            central: 0,
            state: 0,
            cess: 0
        },
        lateFee: {
            integrated: 0,
            central: 0,
            state: 0,
            cess: 0
        }
    };

    // Process ITC payments
    itcPayments.forEach(payment => {
        // Process tax payments
        if (payment.payment.cash) {
            result.tax.integrated.cash += payment.payment.cash.integrated || 0;
            result.tax.central.cash += payment.payment.cash.central || 0;
            result.tax.state.cash += payment.payment.cash.state || 0;
            result.tax.cess.cash += payment.payment.cash.cess || 0;
        }

        if (payment.payment.itcUtilised) {
            result.tax.integrated.itc += payment.payment.itcUtilised.integrated || 0;
            result.tax.central.itc += payment.payment.itcUtilised.central || 0;
            result.tax.state.itc += payment.payment.itcUtilised.state || 0;
            result.tax.cess.itc += payment.payment.itcUtilised.cess || 0;
        }

        // Process interest payments
        if (payment.payment.interest) {
            result.interest.integrated += payment.payment.interest.integrated || 0;
            result.interest.central += payment.payment.interest.central || 0;
            result.interest.state += payment.payment.interest.state || 0;
            result.interest.cess += payment.payment.interest.cess || 0;
        }

        // Process late fee payments
        if (payment.payment.lateFee) {
            result.lateFee.integrated += payment.payment.lateFee.integrated || 0;
            result.lateFee.central += payment.payment.lateFee.central || 0;
            result.lateFee.state += payment.payment.lateFee.state || 0;
            result.lateFee.cess += payment.payment.lateFee.cess || 0;
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
        doc.text(`ARN: ${reportData.header.arn}`, 14, 50);
        doc.text(`Date of ARN: ${reportData.header.arnDate}`, 14, 55);
        doc.text(`Authorized Signatory: ${reportData.header.authorizedSignatory.name}`, 14, 60);

        // Section 3.1 - Outward and inward supplies
        doc.setFontSize(12);
        doc.text('3.1 Outward and inward supplies', 14, 70);

        // Table for section 3.1
        const section31Headers = ['Nature of Supplies', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section31Data = [
            ['(a) Outward taxable supplies',
                reportData.section3_1.outward_taxable.taxableValue,
                reportData.section3_1.outward_taxable.integrated,
                reportData.section3_1.outward_taxable.central,
                reportData.section3_1.outward_taxable.state,
                reportData.section3_1.outward_taxable.cess],
            ['(b) Outward taxable supplies (zero rated)',
                reportData.section3_1.outward_zero.taxableValue,
                reportData.section3_1.outward_zero.integrated,
                '',
                '',
                reportData.section3_1.outward_zero.cess],
            ['(c) Other outward supplies (Nil rated, exempted)',
                reportData.section3_1.outward_nil_exempt.taxableValue,
                '',
                '',
                '',
                ''],
            ['(d) Inward supplies (liable to reverse charge)',
                reportData.section3_1.inward_reverse_charge.taxableValue,
                reportData.section3_1.inward_reverse_charge.integrated,
                reportData.section3_1.inward_reverse_charge.central,
                reportData.section3_1.inward_reverse_charge.state,
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
            startY: 75,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 3.1.1 - E-commerce operator supplies
        doc.setFontSize(12);
        let currentY = doc.lastAutoTable.finalY + 10;
        doc.text('3.1.1 Details regarding section 9(5) supplies', 14, currentY);

        const section311Headers = ['Nature of Supplies', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'CESS'];
        const section311Data = [
            ['Supplies through e-commerce operators',
                reportData.section3_1_1.ecommerce_operator.taxableValue,
                reportData.section3_1_1.ecommerce_operator.integrated,
                reportData.section3_1_1.ecommerce_operator.central,
                reportData.section3_1_1.ecommerce_operator.state,
                reportData.section3_1_1.ecommerce_operator.cess]
        ];

        doc.autoTable({
            head: [section311Headers],
            body: section311Data,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 3.2 - Inter-state supplies
        doc.setFontSize(12);
        currentY = doc.lastAutoTable.finalY + 10;
        doc.text('3.2 Inter-state supplies', 14, currentY);

        const section32Headers = ['Nature of Supplies', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'CESS'];
        const section32Data = [
            ['Supplies to unregistered persons',
                reportData.section3_2.unregistered.taxableValue,
                reportData.section3_2.unregistered.integrated,
                reportData.section3_2.unregistered.central,
                reportData.section3_2.unregistered.state,
                reportData.section3_2.unregistered.cess],
            ['Supplies to composition taxable persons',
                reportData.section3_2.composition.taxableValue,
                reportData.section3_2.composition.integrated,
                reportData.section3_2.composition.central,
                reportData.section3_2.composition.state,
                reportData.section3_2.composition.cess],
            ['Supplies to UIN holders',
                reportData.section3_2.uin.taxableValue,
                reportData.section3_2.uin.integrated,
                reportData.section3_2.uin.central,
                reportData.section3_2.uin.state,
                reportData.section3_2.uin.cess]
        ];

        doc.autoTable({
            head: [section32Headers],
            body: section32Data,
            startY: currentY + 5,
            theme: 'grid',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255,
                fontStyle: 'bold'
            }
        });

        // Section 4 - Input Tax Credit (ITC)
        doc.setFontSize(12);
        currentY = doc.lastAutoTable.finalY + 10;
        doc.text('4. Input Tax Credit (ITC)', 14, currentY);

        // Table for section 4
        const section4Headers = ['Details', 'IGST', 'CGST', 'SGST', 'CESS'];

        const section4Data = [
            ['(A) ITC Available (eligible)',
                reportData.section4.itc.net.integrated,
                reportData.section4.itc.net.central,
                reportData.section4.itc.net.state,
                reportData.section4.itc.net.cess],
            ['(B) ITC Reversed',
                Object.values(reportData.section4.itc.reversed).reduce((sum, cat) => sum + cat.integrated, 0),
                Object.values(reportData.section4.itc.reversed).reduce((sum, cat) => sum + cat.central, 0),
                Object.values(reportData.section4.itc.reversed).reduce((sum, cat) => sum + cat.state, 0),
                Object.values(reportData.section4.itc.reversed).reduce((sum, cat) => sum + cat.cess, 0)],
            ['(C) Net ITC Available (A-B)',
                reportData.section4.itc.net.integrated,
                reportData.section4.itc.net.central,
                reportData.section4.itc.net.state,
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
            ['Exempt supplies',
                reportData.section5.exempt_nil_non_gst.exempt.interstate,
                reportData.section5.exempt_nil_non_gst.exempt.intrastate],
            ['Nil-rated supplies',
                reportData.section5.exempt_nil_non_gst.nil_rated.interstate,
                reportData.section5.exempt_nil_non_gst.nil_rated.intrastate],
            ['Non-GST supplies',
                reportData.section5.exempt_nil_non_gst.non_gst.interstate,
                reportData.section5.exempt_nil_non_gst.non_gst.intrastate]
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

        // Section 5.1 - Interest and Late Fees
        doc.setFontSize(12);
        currentY = doc.lastAutoTable.finalY + 10;
        doc.text('5.1 Interest and Late Fees', 14, currentY);

        const section51Headers = ['Details', 'IGST', 'CGST', 'SGST', 'CESS'];
        const section51Data = [
            ['Interest',
                reportData.section5_1.interest.paid.integrated,
                reportData.section5_1.interest.paid.central,
                reportData.section5_1.interest.paid.state,
                reportData.section5_1.interest.paid.cess],
            ['Late Fee',
                reportData.section5_1.lateFee.integrated,
                reportData.section5_1.lateFee.central,
                reportData.section5_1.lateFee.state,
                reportData.section5_1.lateFee.cess]
        ];

        doc.autoTable({
            head: [section51Headers],
            body: section51Data,
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
                reportData.section6.payment.tax.integrated.cash,
                reportData.section6.payment.tax.central.cash,
                reportData.section6.payment.tax.state.cash,
                reportData.section6.payment.tax.cess.cash],
            ['(b) Tax paid through ITC',
                reportData.section6.payment.tax.integrated.itc,
                reportData.section6.payment.tax.central.itc,
                reportData.section6.payment.tax.state.itc,
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
        integrated: reportData.section3_1.outward_taxable.integrated +
            reportData.section3_1.outward_zero.integrated +
            reportData.section3_1.inward_reverse_charge.integrated,
        central: reportData.section3_1.outward_taxable.central +
            reportData.section3_1.inward_reverse_charge.central,
        state: reportData.section3_1.outward_taxable.state +
            reportData.section3_1.inward_reverse_charge.state,
        cess: reportData.section3_1.outward_taxable.cess +
            reportData.section3_1.outward_zero.cess +
            reportData.section3_1.inward_reverse_charge.cess
    };

    // Get net ITC
    const netITC = reportData.section4.itc.net;

    // Calculate net tax liability (Output Tax - ITC)
    const netLiability = {
        integrated: Math.max(0, outputTax.integrated - netITC.integrated),
        central: Math.max(0, outputTax.central - netITC.central),
        state: Math.max(0, outputTax.state - netITC.state),
        cess: Math.max(0, outputTax.cess - netITC.cess),
    };

    // Calculate total liability
    const totalLiability =
        netLiability.integrated +
        netLiability.central +
        netLiability.state +
        netLiability.cess;

    return {
        outputTax,
        netITC,
        netLiability,
        totalLiability: parseFloat(totalLiability.toFixed(2))
    };
};
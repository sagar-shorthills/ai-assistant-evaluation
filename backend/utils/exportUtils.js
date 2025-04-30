const XLSX = require('xlsx');
const Papa = require('papaparse');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');

/**
 * Export data to Excel format
 * @param {Array} data - Data to export
 * @param {String} filename - Base filename
 * @returns {String} - Base64 encoded Excel file
 */
async function exportToExcel(data, filename) {
    try {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Convert buffer to base64
        return excelBuffer.toString('base64');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw error;
    }
}

/**
 * Export data to CSV format
 * @param {Array} data - Data to export
 * @returns {String} - CSV string
 */
function exportToCSV(data) {
    try {
        return Papa.unparse(data);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw error;
    }
}

/**
 * Export data to PDF format
 * @param {Array} data - Data to export
 * @param {String} filename - Base filename
 * @returns {String} - Base64 encoded PDF
 */
async function exportToPDF(data, filename) {
    try {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(`${filename} - Data Export`, 14, 15);

        // Create table data
        const headers = Object.keys(data[0]);
        const rows = data.map(item => headers.map(header => item[header]));

        // Add table to document
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 20,
            margin: { top: 20 },
            styles: { overflow: 'linebreak' },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            didDrawPage: (data) => {
                // Add page number at the bottom
                doc.setFontSize(10);
                doc.text(
                    `Page ${doc.internal.getNumberOfPages()}`,
                    data.settings.margin.left,
                    doc.internal.pageSize.height - 10
                );
            }
        });

        // Return base64 encoded PDF
        return doc.output('datauristring').split(',')[1];
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
    }
}

/**
 * Generate receipt for specific document
 * @param {Object} document - Document data
 * @returns {String} - Base64 encoded PDF receipt
 */
async function generateReceipt(document) {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Add header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('RECEIPT', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        // Add date and receipt ID
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const today = new Date().toLocaleDateString();
        doc.text(`Date: ${today}`, 20, 30);
        doc.text(`Receipt ID: ${document._id}`, 20, 35);

        // Add horizontal line
        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        // Add item details
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Item Details', 20, 50);

        // Create table for document data
        const tableData = [];
        for (const [key, value] of Object.entries(document)) {
            if (key !== '_id' && key !== 'GST Amount' && key !== 'GST Percentage' && key !== 'Total Amount') {
                tableData.push([key, String(value)]);
            }
        }

        // Add main data table
        doc.autoTable({
            startY: 55,
            head: [['Field', 'Value']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [66, 66, 66],
                textColor: 255
            }
        });

        // Add GST details if available
        if (document['GST Amount'] !== undefined) {
            const finalY = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('GST Details', 20, finalY);

            const gstTableData = [
                ['GST Percentage', `${document['GST Percentage']}%`],
                ['GST Amount', `$ ${document['GST Amount']}`],
                ['Total Amount', `$ ${document['Total Amount']}`]
            ];

            // Add GST table
            doc.autoTable({
                startY: finalY + 5,
                body: gstTableData,
                theme: 'grid',
                styles: {
                    cellPadding: 5
                }
            });
        }

        // Add footer
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.text('Thank you for your business!', doc.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });

        // Return base64 string
        return doc.output('datauristring').split(',')[1];
    } catch (error) {
        console.error('Error generating receipt:', error);
        throw error;
    }
}

module.exports = {
    exportToExcel,
    exportToCSV,
    exportToPDF,
    generateReceipt
};
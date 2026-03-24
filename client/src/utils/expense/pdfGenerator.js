import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { CATEGORIES } from './categories';

export function generatePdfReport(expenses, startDate, endDate) {
  const doc = new jsPDF();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Header
  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('Expense Report', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 35);

  // Summary Table
  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  const summaryData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => [
      `${CATEGORIES[cat]?.emoji || '📦'} ${cat}`,
      `INR ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      `${((amt / (total || 1)) * 100).toFixed(1)}%`
    ]);

  doc.autoTable({
    startY: 45,
    head: [['Category', 'Amount', 'Percentage']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105] },
  });

  // Total Section
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text(`Grand Total: INR ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, finalY);

  // Full Transaction Table
  doc.setFontSize(16);
  doc.setTextColor(5, 150, 105);
  doc.text('Transaction Details', 14, finalY + 20);

  const tableData = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(e => [
      e.date,
      e.title,
      e.category,
      `INR ${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

  doc.autoTable({
    startY: finalY + 25,
    head: [['Date', 'Title', 'Category', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }, // slate-800
    columnStyles: {
      3: { halign: 'right' }
    }
  });

  doc.save(`expense_report_${startDate}_to_${endDate}.pdf`);
}

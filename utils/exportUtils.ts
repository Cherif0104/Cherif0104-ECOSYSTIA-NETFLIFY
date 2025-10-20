import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// === EXCEL EXPORTS ===

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Data') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Auto-size columns
  const maxWidths: { [key: string]: number } = {};
  data.forEach(row => {
    Object.keys(row).forEach(key => {
      const value = String(row[key] || '');
      maxWidths[key] = Math.max(maxWidths[key] || key.length, value.length);
    });
  });
  
  worksheet['!cols'] = Object.keys(data[0]).map(key => ({ wch: Math.min(maxWidths[key] + 2, 50) }));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

export const exportTimeLogsToExcel = (timeLogs: any[], username: string) => {
  const data = timeLogs.map(log => ({
    'Date': new Date(log.date).toLocaleDateString(),
    'Entity Type': log.entity_type,
    'Entity': log.entity_title,
    'Duration (hours)': (log.duration / 60).toFixed(2),
    'Description': log.description || '-'
  }));
  
  const totalHours = timeLogs.reduce((sum, log) => sum + log.duration, 0) / 60;
  
  // Add totals row
  data.push({
    'Date': '',
    'Entity Type': '',
    'Entity': 'TOTAL',
    'Duration (hours)': totalHours.toFixed(2),
    'Description': ''
  });
  
  exportToExcel(
    data,
    `timesheet_${username}_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Time Logs'
  );
};

export const exportTasksToExcel = (tasks: any[], projectTitle: string) => {
  const data = tasks.map(t => ({
    'Task': t.text,
    'Status': t.status,
    'Priority': t.priority,
    'Assignee': t.assignee?.name || 'Unassigned',
    'Estimated Time (h)': t.estimated_time ? (t.estimated_time / 60).toFixed(2) : '-',
    'Logged Time (h)': t.logged_time ? (t.logged_time / 60).toFixed(2) : '0',
    'Due Date': t.due_date ? new Date(t.due_date).toLocaleDateString() : '-'
  }));
  
  exportToExcel(
    data,
    `tasks_${projectTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Tasks'
  );
};

export const exportInvoicesToExcel = (invoices: any[]) => {
  const data = invoices.map(inv => ({
    'Invoice Number': inv.invoice_number,
    'Client': inv.client_name,
    'Amount': inv.amount.toFixed(2),
    'Due Date': new Date(inv.due_date).toLocaleDateString(),
    'Status': inv.status,
    'Paid Amount': inv.paid_amount ? inv.paid_amount.toFixed(2) : '-',
    'Paid Date': inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : '-'
  }));
  
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  
  // Add summary rows
  data.push({} as any);
  data.push({
    'Invoice Number': '',
    'Client': '',
    'Amount': 'TOTAL',
    'Due Date': '',
    'Status': totalAmount.toFixed(2),
    'Paid Amount': '',
    'Paid Date': ''
  });
  data.push({
    'Invoice Number': '',
    'Client': '',
    'Amount': 'TOTAL PAID',
    'Due Date': '',
    'Status': totalPaid.toFixed(2),
    'Paid Amount': '',
    'Paid Date': ''
  });
  data.push({
    'Invoice Number': '',
    'Client': '',
    'Amount': 'REMAINING',
    'Due Date': '',
    'Status': (totalAmount - totalPaid).toFixed(2),
    'Paid Amount': '',
    'Paid Date': ''
  });
  
  exportToExcel(
    data,
    `invoices_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Invoices'
  );
};

export const exportExpensesToExcel = (expenses: any[]) => {
  const data = expenses.map(exp => ({
    'Date': new Date(exp.date).toLocaleDateString(),
    'Category': exp.category,
    'Description': exp.description,
    'Amount': exp.amount.toFixed(2),
    'Due Date': exp.due_date ? new Date(exp.due_date).toLocaleDateString() : '-',
    'Status': exp.status
  }));
  
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Add total row
  data.push({} as any);
  data.push({
    'Date': '',
    'Category': '',
    'Description': 'TOTAL',
    'Amount': total.toFixed(2),
    'Due Date': '',
    'Status': ''
  });
  
  exportToExcel(
    data,
    `expenses_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Expenses'
  );
};

export const exportContactsToExcel = (contacts: any[]) => {
  const data = contacts.map(c => ({
    'Name': c.name,
    'Company': c.company,
    'Work Email': c.work_email || c.workEmail,
    'Personal Email': c.personal_email || c.personalEmail || '-',
    'Mobile': c.mobile_phone || c.mobilePhone || '-',
    'WhatsApp': c.whatsapp_number || c.whatsappNumber || '-',
    'Status': c.status
  }));
  
  exportToExcel(
    data,
    `contacts_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Contacts'
  );
};

// === PDF EXPORTS ===

export const exportProjectToPDF = (project: any, tasks: any[], risks: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(`Project Report: ${project.title}`, 20, 20);
  
  // Metadata
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`Status: ${project.status}`, 20, 36);
  doc.text(`Due Date: ${new Date(project.due_date || project.dueDate).toLocaleDateString()}`, 20, 42);
  
  // Description
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Description', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const description = doc.splitTextToSize(project.description, 170);
  doc.text(description, 20, 63);
  
  let yPos = 63 + (description.length * 5) + 10;
  
  // Tasks Table
  if (tasks && tasks.length > 0) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Tasks', 20, yPos);
    yPos += 5;
    
    const taskData = tasks.map(t => [
      t.text,
      t.status,
      t.priority,
      t.assignee?.name || 'Unassigned'
    ]);
    
    autoTable(doc, {
      head: [['Task', 'Status', 'Priority', 'Assignee']],
      body: taskData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Risks Table
  if (risks && risks.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Risks', 20, yPos);
    yPos += 5;
    
    const riskData = risks.map(r => [
      r.description,
      r.likelihood,
      r.impact
    ]);
    
    autoTable(doc, {
      head: [['Description', 'Likelihood', 'Impact']],
      body: riskData,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] }
    });
  }
  
  // Save
  doc.save(`project_${project.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportOKRsToPDF = (objectives: any[], projectTitle?: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('OKRs Report', 20, 20);
  
  if (projectTitle) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Project: ${projectTitle}`, 20, 30);
  }
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, projectTitle ? 37 : 30);
  
  let yPos = projectTitle ? 50 : 45;
  
  // Objectives
  objectives.forEach((obj, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    // Objective title
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${obj.title}`, 20, yPos);
    yPos += 8;
    
    // Key Results
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    obj.keyResults.forEach((kr: any) => {
      const progress = ((kr.current / kr.target) * 100).toFixed(1);
      const text = `   • ${kr.title}: ${kr.current} / ${kr.target} ${kr.unit} (${progress}%)`;
      
      doc.text(text, 20, yPos);
      yPos += 6;
    });
    
    yPos += 5;
  });
  
  // Save
  const filename = projectTitle 
    ? `okrs_${projectTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    : `okrs_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
};

export const exportFinancialSummaryToPDF = (invoices: any[], expenses: any[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Financial Summary Report', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Calculate totals
  const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaidInvoices = invoices.reduce((sum, inv) => sum + (inv.paid_amount || inv.paidAmount || 0), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalPaidInvoices - totalExpenses;
  
  // Summary
  let yPos = 45;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Invoices Amount: $${totalInvoices.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Total Paid: $${totalPaidInvoices.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Total Outstanding: $${(totalInvoices - totalPaidInvoices).toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 20, yPos);
  yPos += 10;
  
  doc.setFont(undefined, 'bold');
  doc.text(`Net Profit: $${netProfit.toFixed(2)}`, 20, yPos);
  yPos += 15;
  
  // Invoices Table
  doc.setFontSize(12);
  doc.text('Invoices', 20, yPos);
  yPos += 5;
  
  const invoiceData = invoices.slice(0, 10).map(inv => [
    inv.invoice_number || inv.invoiceNumber,
    inv.client_name || inv.clientName,
    `$${inv.amount.toFixed(2)}`,
    inv.status
  ]);
  
  autoTable(doc, {
    head: [['Invoice #', 'Client', 'Amount', 'Status']],
    body: invoiceData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Expenses Table
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Recent Expenses', 20, yPos);
  yPos += 5;
  
  const expenseData = expenses.slice(0, 10).map(exp => [
    exp.category,
    exp.description,
    `$${exp.amount.toFixed(2)}`,
    exp.status
  ]);
  
  autoTable(doc, {
    head: [['Category', 'Description', 'Amount', 'Status']],
    body: expenseData,
    startY: yPos,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [239, 68, 68] }
  });
  
  // Save
  doc.save(`financial_summary_${new Date().toISOString().split('T')[0]}.pdf`);
};


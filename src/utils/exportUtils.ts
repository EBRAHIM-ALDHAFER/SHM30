/**
 * مصفوفة ووظائف مساعدة لتصدير البيانات إلى ملفات Excel و PDF
 * تدعم شاشات وقوائم النظام بالكامل باللغة العربية RTL وبشكل منسق وسلس
 */

export interface ExportColumn {
  key: string;
  label: string;
  format?: (v: any) => string;
}

/**
 * تصدير البيانات إلى تنسيق Excel (XML/HTML يدعم التنسيق والعربية بالقروب)
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string
) {
  // نقوم ببناء ملف HTML متطابق مع متطلبات Excel لضمان الاتساق والترميز العربي RTL وضمان ظهور الخلايا منسقة
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8" />`;
  html += `<style>`;
  html += `table { border-collapse: collapse; direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }`;
  html += `th { background-color: #2a3447; color: #ffffff; font-weight: bold; border: 1px solid #d1d5db; padding: 12px; text-align: center; }`;
  html += `td { border: 1px solid #e5e7eb; padding: 10px; text-align: right; font-size: 13px; }`;
  html += `.cost-val { color: #f87171; font-family: monospace; }`;
  html += `.price-val { color: #10b981; font-family: monospace; font-weight: bold; }`;
  html += `.sku-val { font-family: monospace; color: #6b7280; text-align: center; }`;
  html += `</style></head><body><table><thead><tr>`;
  
  columns.forEach(col => {
    html += `<th>${col.label}</th>`;
  });
  
  html += `</tr></thead><tbody>`;
  
  data.forEach((item, index) => {
    html += `<tr>`;
    columns.forEach(col => {
      // التعامل مع الكائنات الفرعية باستخدام مسارات مثل 'address.city' أو 'user.name'
      let val = "";
      if (col.key.includes('.')) {
        const parts = col.key.split('.');
        let objValue: any = item;
        for (const p of parts) {
          objValue = objValue ? objValue[p] : "";
        }
        val = col.format ? col.format(objValue) : objValue;
      } else {
        val = col.format ? col.format(item[col.key]) : item[col.key];
      }

      if (val === undefined || val === null) val = "";
      
      // تطبيق كلاسات تجميلية متوافقة
      let cellStyleClass = "";
      if (col.key === 'sku' || col.key === 'barcode') cellStyleClass = ' class="sku-val"';
      if (col.key === 'price' || col.key === 'total' || col.key === 'balance' || col.key === 'sales') cellStyleClass = ' class="price-val"';
      if (col.key === 'cost') cellStyleClass = ' class="cost-val"';

      html += `<td${cellStyleClass}>${val}</td>`;
    });
    html += `</tr>`;
  });
  
  html += `</tbody></table></body></html>`;
  
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * تصدير البيانات إلى مستند PDF مجهز للطباعة مع دعم الخطوط والنسق العربي بالكامل RTL
 */
export function exportToPDF(
  title: string,
  columns: ExportColumn[],
  data: any[],
  subTitle: string = "منصة سهم الكاشير المتكاملة ⚡"
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("عذراً، الرجاء تفعيل أو السماح بظهور النوافذ المنبثقة (Popups) في متصفحك لتتمكن من استعراض وحفظ ملف الـ PDF.");
    return;
  }

  let html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <title>${title}</title>
      <meta charset="utf-8" />
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <style>
        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
          background-color: #ffffff;
          color: #1a1a1a;
          margin: 40px;
          padding: 0;
          direction: rlt;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3.5px solid #0f172a;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .title-section h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.025em;
        }
        .title-section .subtitle {
          font-size: 13px;
          color: #4b5563;
          margin-top: 6px;
          font-weight: 600;
        }
        .system-meta {
          font-size: 11px;
          color: #4b5563;
          text-align: left;
          line-height: 1.8;
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        th {
          background-color: #0f172a;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          border: 1px solid #1e293b;
          padding: 14px 12px;
          text-align: right;
        }
        td {
          padding: 12px;
          font-size: 12px;
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #f1f5f9;
          border-right: 1px solid #f1f5f9;
          color: #334155;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .text-mono {
          font-family: monospace;
          font-weight: 600;
        }
        .total-row {
          background-color: #f1f5f9 !important;
          font-weight: 800;
        }
        .footer {
          margin-top: 60px;
          font-size: 11px;
          color: #64748b;
          text-align: center;
          border-top: 2px dashed #cbd5e1;
          padding-top: 20px;
          font-weight: 600;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #f1f5f9;
          padding: 12px 24px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .btn-print {
          background-color: #0284c7;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Cairo', sans-serif;
          transition: background-color 0.2s;
        }
        .btn-print:hover {
          background-color: #0369a1;
        }
        .print-tip {
          font-size: 11px;
          color: #475569;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="no-print action-bar">
        <span class="print-tip">💡 نصيحة: لحفظ التقرير كملف PDF، اختر "حفظ كملف PDF" (Save as PDF) من وجهات الطباعة في المتصفح.</span>
        <button class="btn-print" onclick="window.print()">طباعة التقرير / تحميل PDF 📄</button>
      </div>

      <div class="header-container">
        <div class="title-section">
          <h1>${title}</h1>
          <div class="subtitle">${subTitle}</div>
        </div>
        <div class="system-meta">
          <div>تاريخ الطباعة: <span class="text-mono">${new Date().toLocaleDateString('ar-SA')}</span></div>
          <div>وقت العمليات: <span class="text-mono">${new Date().toLocaleTimeString('ar-SA')}</span></div>
          <div>إجمالي العدد المسجل: <span class="text-mono">${data.length} عنصر</span></div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
  `;

  columns.forEach(col => {
    html += `<th>${col.label}</th>`;
  });

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach(item => {
    html += `<tr>`;
    columns.forEach(col => {
      let val = "";
      if (col.key.includes('.')) {
        const parts = col.key.split('.');
        let objValue: any = item;
        for (const p of parts) {
          objValue = objValue ? objValue[p] : "";
        }
        val = col.format ? col.format(objValue) : objValue;
      } else {
        val = col.format ? col.format(item[col.key]) : item[col.key];
      }

      if (val === undefined || val === null) val = "";
      
      let tdClass = "";
      if (col.key === 'sku' || col.key === 'phone' || col.key === 'id') {
        tdClass = ' class="text-mono"';
      }
      
      html += `<td${tdClass}>${val}</td>`;
    });
    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
      
      <div class="footer">
        تم تصدير وحظر هذا المستند الإلكتروني الرسمي بواسطة سهم كاشير وسهم سحابة. جميع الحقوق محفوظة لـ ماراثون الحلول البرمجية الذكية © ${new Date().getFullYear()}
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

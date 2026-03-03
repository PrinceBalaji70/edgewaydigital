/* ============================================================
   Google Apps Script — Code.gs
   Edgeway Digital Services — Contact Form Logger
   
   SETUP STEPS (do this once):
   1. Go to sheets.google.com → create a new spreadsheet
   2. Name it: "Edgeway Contact Form Submissions"
   3. Click Extensions → Apps Script
   4. Delete any existing code, paste THIS entire file
   5. Click Save (💾), then Deploy → New Deployment
   6. Type: Web App
   7. Execute as: Me
   8. Who has access: Anyone
   9. Click Deploy → copy the Web App URL
   10. Paste that URL into js/form.js → GOOGLE_SCRIPT
   ============================================================ */

// Column headers — must match payload keys in form.js
const HEADERS = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Email',
  'Service',
  'Message',
  'Source IP'   // optional, captured server-side
];

/* ── Called automatically on form POST ──────────────────── */
function doPost(e) {
  try {
    // Parse incoming JSON payload
    const data = JSON.parse(e.postData.contents);

    const sheet = getOrCreateSheet();

    // Write header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    }

    // Append the new submission row
    sheet.appendRow([
      new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      sanitize(data.firstName),
      sanitize(data.lastName),
      sanitize(data.email),
      sanitize(data.service),
      sanitize(data.message),
      e.parameter.userIp || 'N/A'
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, HEADERS.length);

    // Optional: send notification email on every new submission
    sendNotificationEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doPost: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ── GET handler (health check / test) ──────────────────── */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Edgeway form endpoint is live ✅' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Get existing sheet or create one ───────────────────── */
function getOrCreateSheet() {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Submissions';
  let sheet       = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/* ── Format the header row (bold + background) ───────────── */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#6c63ff');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);
  sheet.setFrozenRows(1); // freeze header so it stays visible on scroll
}

/* ── Email notification to Balaji on each submission ────── */
function sendNotificationEmail(data) {
  const recipient = 'balaji@edgewaydigital.com';
  const subject   = `📬 New Inquiry: ${data.firstName} ${data.lastName} — ${data.service}`;
  const body      = `
New contact form submission on Edgeway Digital Services website.

───────────────────────────────
Name      : ${data.firstName} ${data.lastName}
Email     : ${data.email}
Service   : ${data.service}
Time      : ${new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
───────────────────────────────

Message:
${data.message}

───────────────────────────────
Reply directly to: ${data.email}
View all submissions: https://docs.google.com/spreadsheets/d/${SpreadsheetApp.getActiveSpreadsheet().getId()}
  `.trim();

  try {
    GmailApp.sendEmail(recipient, subject, body, {
      replyTo: data.email   // clicking Reply in Gmail goes to the inquirer
    });
  } catch (err) {
    Logger.log('Email notification failed: ' + err.message);
    // Non-fatal — submission is still logged to sheet
  }
}

/* ── Sanitize input to prevent formula injection ─────────── */
function sanitize(value) {
  if (typeof value !== 'string') return '';
  // Strip leading =, +, -, @ which could be used for CSV/formula injection
  return value.replace(/^[=+\-@]/, '').trim();
}

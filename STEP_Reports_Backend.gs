/**
 * AL Omran STEP Course — shared Pre-Course Test reports
 *
 * SETUP:
 * 1) Before running setupStepReports(), change TEACHER_PIN below to a private PIN.
 * 2) Run setupStepReports() once and authorize the requested permissions.
 * 3) Open Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 4) Deploy, copy the Web app URL ending in /exec.
 * 5) In the course website select Teacher > Pre-Course Test Reports.
 *    Paste the URL and the same PIN, save, then create/copy the student link.
 *
 * The student website sends completed attempts using POST.
 * The teacher dashboard reads reports using a PIN-protected JSONP GET.
 */

const TEACHER_PIN = 'CHANGE_THIS_TO_A_PRIVATE_PIN';
const SHEET_PROPERTY = 'AL_OMRAN_STEP_REPORT_SHEET_ID';
const REPORT_SHEET_NAME = 'Pre-Course Test Reports';

function setupStepReports() {
  if (!TEACHER_PIN || TEACHER_PIN === 'CHANGE_THIS_TO_A_PRIVATE_PIN' || TEACHER_PIN.length < 4) {
    throw new Error('Edit TEACHER_PIN at the top of this file to a private PIN (at least 4 characters), then run setupStepReports() again.');
  }

  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(SHEET_PROPERTY);
  let ss;

  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create('AL Omran STEP Course — Pre-Course Test Reports');
    props.setProperty(SHEET_PROPERTY, ss.getId());
  }

  let sheet = ss.getSheetByName(REPORT_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(REPORT_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Submitted At', 'Student Name', 'Score', 'Total', 'Percentage',
      'Correct', 'Incorrect', 'Unanswered', 'Attempt ID', 'Detailed Answers JSON'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#dff1e3');
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(10, 500);
  }

  Logger.log('STEP report spreadsheet: ' + ss.getUrl());
  Logger.log('Now deploy this Apps Script as a Web App (Execute as Me; access Anyone).');
  return ss.getUrl();
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Empty submission.');
    const data = JSON.parse(e.postData.contents);
    if (data.type !== 'AL_OMRAN_STEP_PRECOURSE_ATTEMPT') throw new Error('Unsupported report type.');
    const studentName = String(data.studentName || '').trim();
    const answers = Array.isArray(data.answers) ? data.answers : [];
    if (studentName.length < 3) throw new Error('Student name is required.');
    if (answers.length !== 70) throw new Error('Expected 70 answer records.');

    const sheet = getReportSheet_();
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      sheet.appendRow([
        data.submittedAt || new Date().toISOString(),
        studentName,
        Number(data.score || 0),
        Number(data.total || 70),
        Number(data.percentage || 0),
        Number(data.correctCount || 0),
        Number(data.incorrectCount || 0),
        Number(data.unansweredCount || 0),
        String(data.attemptId || ''),
        JSON.stringify(answers)
      ]);
    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'Report saved.' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = String(params.callback || '');
  const validCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback);
  const respond = function(payload) {
    const json = JSON.stringify(payload);
    const body = validCallback ? callback + '(' + json + ');' : json;
    return ContentService.createTextOutput(body)
      .setMimeType(validCallback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
  };

  if (params.action !== 'reports') return respond({ ok: true, service: 'AL Omran STEP Reports' });
  if (!constantTimeEquals_(String(params.pin || ''), TEACHER_PIN)) {
    return respond({ ok: false, error: 'Incorrect teacher PIN.' });
  }

  try {
    const sheet = getReportSheet_();
    const values = sheet.getDataRange().getValues();
    const reports = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      let answers = [];
      try { answers = JSON.parse(String(row[9] || '[]')); } catch (ignore) {}
      reports.push({
        submittedAt: row[0] instanceof Date ? row[0].toISOString() : String(row[0] || ''),
        studentName: String(row[1] || ''),
        score: Number(row[2] || 0),
        total: Number(row[3] || 70),
        percentage: Number(row[4] || 0),
        correctCount: Number(row[5] || 0),
        incorrectCount: Number(row[6] || 0),
        unansweredCount: Number(row[7] || 0),
        attemptId: String(row[8] || ''),
        answers: answers
      });
    }
    return respond({ ok: true, reports: reports });
  } catch (err) {
    return respond({ ok: false, error: String(err.message || err) });
  }
}

function getReportSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(SHEET_PROPERTY);
  if (!id) throw new Error('Run setupStepReports() before using the report service.');
  const ss = SpreadsheetApp.openById(id);
  let sheet = ss.getSheetByName(REPORT_SHEET_NAME);
  if (!sheet) throw new Error('The report sheet is missing. Run setupStepReports() again.');
  return sheet;
}

function constantTimeEquals_(a, b) {
  if (!b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

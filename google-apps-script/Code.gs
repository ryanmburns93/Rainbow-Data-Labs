/**
 * Rainbow Data Labs contact form backend.
 *
 * Deploy this as a Google Apps Script Web App bound to a Google Sheet.
 * Each submission from the site's contact form becomes one row in the
 * sheet: Timestamp | Name | Email | Message, and an email notification
 * is sent to NOTIFY_EMAIL.
 *
 * Setup: see ../google-apps-script/SETUP.md
 */

var SHEET_NAME = 'Inquiries';
var HEADERS = ['Timestamp', 'Name', 'Email', 'Message'];

// Where new-message notifications go. Leave empty to send them to the
// Google account that owns this script; add more addresses separated
// by commas.
var NOTIFY_EMAIL = '';
var SITE_NAME = 'rainbowdatalabs.com';

function doPost(e) {
  try {
    var params = parseRequestParams(e);

    // Honeypot: bots fill every field, real visitors never see or fill
    // this one (it's hidden via CSS). Pretend success, skip recording.
    if (params.company) {
      return jsonResponse({ ok: true });
    }

    var name = (params.name || '').toString().trim();
    var email = (params.email || '').toString().trim();
    var message = (params.message || '').toString().trim();

    if (!name || !email || !message) {
      return jsonResponse({ ok: false, error: 'Missing required field(s).' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ ok: false, error: 'Invalid email address.' });
    }

    var sheet = getInquiriesSheet();
    var timestamp = new Date();
    sheet.appendRow([timestamp, name, email, message]);

    // The message is already saved, so a mail problem (e.g. the daily
    // quota) must not turn into an error for the visitor.
    try {
      sendNotification(timestamp, name, email, message);
    } catch (mailErr) {
      console.error('Notification failed: ' + mailErr.message);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Server error: ' + err.message });
  }
}

function parseRequestParams(e) {
  // The form is POSTed as a URL-encoded body with a text/plain content
  // type (to avoid a CORS preflight from the browser), so e.parameter
  // is not reliably populated. Parse e.postData.contents ourselves.
  var params = {};
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : '';

  raw.split('&').forEach(function (pair) {
    if (!pair) return;
    var idx = pair.indexOf('=');
    var key = idx === -1 ? pair : pair.slice(0, idx);
    var value = idx === -1 ? '' : pair.slice(idx + 1);
    params[decodeURIComponent(key.replace(/\+/g, ' '))] =
      decodeURIComponent(value.replace(/\+/g, ' '));
  });

  return params;
}

function getInquiriesSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }

  return sheet;
}

function sendNotification(timestamp, name, email, message) {
  var recipient = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  var sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  var shortName = name.replace(/[\r\n]+/g, ' ').slice(0, 80);

  MailApp.sendEmail({
    to: recipient,
    replyTo: email,
    name: SITE_NAME + ' contact form',
    subject: 'New inquiry from ' + shortName + ' via ' + SITE_NAME,
    body: [
      'New inquiry on ' + SITE_NAME + ':',
      '',
      'From: ' + shortName + ' <' + email + '>',
      'Received: ' + timestamp.toString(),
      '',
      message,
      '',
      '--',
      'Reply to this email to answer ' + shortName + ' directly.',
      'All messages: ' + sheetUrl
    ].join('\n')
  });
}

/**
 * Run this once from the Apps Script editor (select it, then Run) to grant
 * email permission and confirm notifications arrive.
 */
function testNotification() {
  sendNotification(new Date(), 'Test Visitor', Session.getEffectiveUser().getEmail(),
    'This is a test notification from the contact form script.');
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

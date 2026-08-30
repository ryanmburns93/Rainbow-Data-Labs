/**
 * Rainbow Data Labs contact form backend.
 *
 * Deploy this as a Google Apps Script Web App bound to a Google Sheet.
 * Each submission from the site's contact form becomes one row in the
 * sheet: Timestamp | Name | Email | Message.
 *
 * Setup: see ../google-apps-script/SETUP.md
 */

var SHEET_NAME = 'Inquiries';
var HEADERS = ['Timestamp', 'Name', 'Email', 'Message'];

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
    sheet.appendRow([new Date(), name, email, message]);

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

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

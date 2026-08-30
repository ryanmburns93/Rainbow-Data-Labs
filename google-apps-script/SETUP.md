# Contact form → Google Sheets setup

The site is static (GitHub Pages), so the contact form can't POST to a
server it doesn't have. Instead it POSTs to a small Google Apps Script
web app that you own, which appends each inquiry as a row in a Google
Sheet you own.

## 1. Create the sheet

Create a new Google Sheet (e.g. "Rainbow Data Labs — Inquiries"). Leave
it empty; the script creates its own "Inquiries" tab and header row on
first use.

## 2. Add the script

In the Sheet: **Extensions → Apps Script**. Delete the placeholder
`Code.gs` contents and paste in the contents of
[`Code.gs`](./Code.gs) from this folder. Save (Ctrl/Cmd+S).

## 3. Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**, and authorize the script when prompted (it only
   needs access to this one Sheet).
5. Copy the **Web app URL** — it ends in `/exec`.

## 4. Wire it into the site

Send me that URL and I'll drop it into `assets/js/contact-form.js`
(the `ENDPOINT_URL` constant at the top of the file).

## Notes

- If you ever edit and re-save the script, you must create a **new
  deployment version** (Deploy → Manage deployments → edit → New
  version) for the change to take effect — the `/exec` URL stays the
  same.
- The hidden "company" field in the form is a spam honeypot; real
  visitors never see or fill it, so any submission that has it filled
  in is silently dropped.
- Submissions land in the "Inquiries" tab of your Sheet. You can sort,
  filter, or pull them into anything else Sheets connects to from
  there.

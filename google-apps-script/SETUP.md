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

## 5. Email notifications

The script emails you each time an inquiry is saved. The email comes from
your own Gmail account, has the inquiry in the body, and has **Reply-To set
to the visitor**, so hitting Reply answers them directly.

To turn it on (or after pasting in an updated `Code.gs`):

1. In the Apps Script editor, replace the code with the updated
   [`Code.gs`](./Code.gs) and save.
2. Pick **`testNotification`** from the function dropdown in the toolbar
   and click **Run**.
3. Google asks for permission to **send email as you**. Approve it. You may
   see "Google hasn't verified this app": choose **Advanced → Go to (project
   name)**. It's your own script, so this is expected.
4. Check your inbox for the test email.
5. **Deploy → Manage deployments** → pencil icon → **Version: New version** →
   **Deploy**. The live form only uses the updated script after this step. The
   `/exec` URL stays the same.

Notifications go to the account that owns the script. To send them
somewhere else, or to several people, set `NOTIFY_EMAIL` at the top of the
script (comma-separated), then repeat step 5.

Limits: a personal Gmail account can send about 100 of these a day. If a
notification fails, the inquiry is still saved to the Sheet, and the
visitor still sees "Thanks". Spam caught by the honeypot sends no email.

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

/**
 * Sends the contact form to the Google Apps Script web app configured
 * below instead of letting it POST to the page itself (which is what
 * caused the 405 on GitHub Pages — static hosting can't handle POST).
 *
 * See google-apps-script/SETUP.md for how to get an ENDPOINT_URL.
 */
(function () {
	'use strict';

	var ENDPOINT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

	var form = document.getElementById('contact-form');
	if (!form) return;

	var status = document.getElementById('contact-form-status');
	var submitButton = form.querySelector('input[type="submit"]');

	function setStatus(message, kind) {
		status.textContent = message;
		status.className = 'contact-form-status' + (kind ? ' ' + kind : '');
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();

		if (!ENDPOINT_URL || ENDPOINT_URL.indexOf('PASTE_YOUR') === 0) {
			setStatus('The contact form is not configured yet. Please email us directly instead.', 'error');
			return;
		}

		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		var data = {
			name: document.getElementById('contact-name').value,
			email: document.getElementById('contact-email').value,
			message: document.getElementById('contact-message').value,
			company: document.getElementById('contact-company').value
		};

		var body = Object.keys(data)
			.map(function (key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
			})
			.join('&');

		submitButton.disabled = true;
		setStatus('Sending…');

		fetch(ENDPOINT_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'text/plain;charset=utf-8' },
			body: body
		})
			.then(function (response) { return response.json(); })
			.then(function (result) {
				if (result.ok) {
					setStatus("Thanks — we'll be in touch soon.", 'success');
					form.reset();
				} else {
					setStatus(result.error || 'Something went wrong. Please try again.', 'error');
				}
			})
			.catch(function () {
				setStatus('Something went wrong. Please try again or email us directly.', 'error');
			})
			.finally(function () {
				submitButton.disabled = false;
			});
	});
})();

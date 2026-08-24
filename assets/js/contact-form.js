/*
	Contact form handler — Rainbow Data Labs
	Vanilla JS (no jQuery dependency). Submits the contact form as JSON to a
	Cloudflare Worker endpoint. The worker MUST independently re-validate and
	re-check for spam server-side — this client-side logic is trivially
	bypassable and only exists to keep the UX fast and to filter naive bots.
*/
(function () {
	'use strict';

	// TODO: replace with the deployed Cloudflare Worker URL before going live.
	const WORKER_URL = 'https://REPLACE_ME.workers.dev';

	const form = document.getElementById('contact-form');
	if (!form) return;

	const statusEl = document.getElementById('contact-form-status');
	const submitBtn = document.getElementById('contact-submit');
	const resetBtn = document.getElementById('contact-reset');
	const nameField = document.getElementById('contact-name');
	const emailField = document.getElementById('contact-email');
	const messageField = document.getElementById('contact-message');
	const honeypot = document.getElementById('contact-company');

	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const submitLabel = submitBtn ? submitBtn.value : 'Send Message';

	function setStatus(message, type) {
		if (!statusEl) return;
		statusEl.textContent = message || '';
		statusEl.classList.remove('success', 'error');
		if (type) statusEl.classList.add(type);
	}

	function setLoading(isLoading) {
		if (!submitBtn) return;
		submitBtn.disabled = isLoading;
		submitBtn.classList.toggle('is-loading', isLoading);
		if (resetBtn) resetBtn.disabled = isLoading;
		submitBtn.value = isLoading ? 'Sending…' : submitLabel;
	}

	function validate(data) {
		if (!data.name) return 'Please enter your name.';
		if (!data.email || !EMAIL_RE.test(data.email)) return 'Please enter a valid email address.';
		if (!data.message) return 'Please enter a message.';
		return null;
	}

	form.addEventListener('submit', function (event) {
		event.preventDefault();

		// Honeypot tripped: fake a success and bail out without ever
		// contacting the worker (don't tip off the bot, don't waste a request).
		if (honeypot && honeypot.value) {
			setStatus('Thanks! Your message has been sent.', 'success');
			form.reset();
			return;
		}

		const data = {
			name: nameField ? nameField.value.trim() : '',
			email: emailField ? emailField.value.trim() : '',
			message: messageField ? messageField.value.trim() : ''
		};

		const validationError = validate(data);
		if (validationError) {
			setStatus(validationError, 'error');
			return;
		}

		if (WORKER_URL.indexOf('REPLACE_ME') !== -1) {
			setStatus('Form is not yet connected — set WORKER_URL in assets/js/contact-form.js.', 'error');
			return;
		}

		setLoading(true);
		setStatus('Sending your message…');

		fetch(WORKER_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Request failed with status ' + response.status);
				}
				return response;
			})
			.then(function () {
				setStatus('Thanks! Your message has been sent — we will follow up soon.', 'success');
				form.reset();
			})
			.catch(function () {
				setStatus('Something went wrong sending your message. Please try again or email us directly.', 'error');
			})
			.finally(function () {
				setLoading(false);
			});
	});
})();

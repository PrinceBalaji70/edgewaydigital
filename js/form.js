/* ============================================================
   js/form.js — Edgeway Digital Services
   Contact form: validation + Google Sheets submission
   ============================================================ */

(function () {
  'use strict';

  /* ── ✏️  CONFIG — paste your Apps Script URL here ────────── */
  const GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbzh8Oz8OyW8f6Ze8vthUzKUhEFBrg5uEbLJg7MZsDmirSEpHTOmMnjRjJFSCuGDCPqm/exec';
  // e.g. 'https://script.google.com/macros/s/AKfycb.../exec'
  /* ────────────────────────────────────────────────────────── */

  const btn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccess');

  /* ── Field references ────────────────────────────────────── */
  const fields = {
    firstName: { el: document.getElementById('firstName'), err: document.getElementById('firstNameErr') },
    lastName: { el: document.getElementById('lastName'), err: document.getElementById('lastNameErr') },
    email: { el: document.getElementById('email'), err: document.getElementById('emailErr') },
    service: { el: document.getElementById('service'), err: document.getElementById('serviceErr') },
    message: { el: document.getElementById('message'), err: document.getElementById('messageErr') },
  };

  /* ── Validators ──────────────────────────────────────────── */
  const validators = {
    firstName: v => v.trim().length >= 2 ? '' : 'Please enter your first name (min 2 chars).',
    lastName: v => v.trim().length >= 2 ? '' : 'Please enter your last name (min 2 chars).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    service: v => v !== '' ? '' : 'Please select a service.',
    message: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
  };

  /* ── Validate single field ───────────────────────────────── */
  function validateField(name) {
    const { el, err } = fields[name];
    const msg = validators[name](el.value);
    err.textContent = msg;
    el.classList.toggle('error', !!msg);
    return !msg;
  }

  /* ── Live validation ─────────────────────────────────────── */
  Object.keys(fields).forEach(name => {
    fields[name].el.addEventListener('blur', () => validateField(name));
    fields[name].el.addEventListener('input', () => {
      if (fields[name].el.classList.contains('error')) validateField(name);
    });
  });

  /* ── Validate all ────────────────────────────────────────── */
  function validateAll() {
    return Object.keys(fields).map(validateField).every(Boolean);
  }

  /* ── Reset form ──────────────────────────────────────────── */
  function resetForm() {
    Object.values(fields).forEach(({ el, err }) => {
      el.value = '';
      el.classList.remove('error');
      err.textContent = '';
    });
  }

  /* ── Build payload ───────────────────────────────────────── */
  function getPayload() {
    return {
      firstName: fields.firstName.el.value.trim(),
      lastName: fields.lastName.el.value.trim(),
      email: fields.email.el.value.trim(),
      service: fields.service.el.value,
      message: fields.message.el.value.trim(),
      timestamp: new Date().toISOString(),
    };
  }

  /* ── Send to Google Sheets via Apps Script ───────────────── */
  async function submitToGoogleSheet(payload) {
    // Uses no-cors because Apps Script doesn't return CORS headers.
    // We can't read the response — but the data IS written to the sheet.
    await fetch(GOOGLE_SCRIPT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  /* ── Submit button click ─────────────────────────────────── */
  btn.addEventListener('click', async () => {
    if (!validateAll()) return;

    const payload = getPayload();

    // UI: loading state
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      await submitToGoogleSheet(payload);

      resetForm();
      successMsg.style.display = 'block';
      setTimeout(() => { successMsg.style.display = 'none'; }, 5000);

    } catch (err) {
      console.error('Submission error:', err);
      alert('Something went wrong. Please email us directly at balaji@edgewaydigital.com');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

})();

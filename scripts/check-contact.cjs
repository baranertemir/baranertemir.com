// Isolated form behavior tests: no network calls or real messages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/main.js', 'utf8');
const contact = source.slice(source.indexOf('// contact form'), source.indexOf('// site views counter'));
function setup(fetch, captchaOptions = null) {
  const nodes = {};
  for (const id of ['contact-form', 'purpose-select', 'purpose-trigger', 'purpose-menu', 'purpose-placeholder', 'contact-purpose', 'contact-status', 'contact-send', 'contact-email', 'contact-message']) {
    nodes[id] = { value: '', textContent: '', dataset: {}, disabled: false, handlers: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, handler) { this.handlers[name] = handler; },
      setAttribute() {}, querySelectorAll() { return []; }, querySelector() { return null; }, contains() { return false; }, focus() {} };
  }
  nodes['contact-form'].action = 'https://formspree.io/f/mrppdynn';
  nodes['contact-form'].reset = () => { nodes['contact-email'].value = ''; nodes['contact-message'].value = ''; };
  nodes['contact-email'].value = 'test@example.com';
  nodes['contact-message'].value = 'Local test';
  nodes['contact-purpose'].value = 'research';
  nodes['purpose-placeholder'].textContent = 'Security research';
  nodes['purpose-placeholder'].dataset.placeholder = 'false';
  const browser = {matchMedia: () => ({matches:true})};
  if (captchaOptions) {
    nodes['contact-captcha'] = {dataset: {sitekey: 'test-key'}};
    if (!captchaOptions.unavailable) browser.turnstile = {
      render(selector, callbacks) { captchaOptions.callbacks = callbacks; if (captchaOptions.token) callbacks.callback(captchaOptions.token); return 'widget-1'; },
      reset(id) { assert.equal(id, 'widget-1'); captchaOptions.resets = (captchaOptions.resets || 0) + 1; },
    };
  }
  vm.runInNewContext(contact, { document: {getElementById: id => nodes[id], addEventListener() {}}, window: browser, fetch, AbortController, setTimeout, clearTimeout, setInterval, clearInterval });
  return { nodes, submit: () => nodes['contact-form'].handlers.submit({preventDefault(){}}) };
}
(async () => {
  let calls = 0;
  let finish;
  const success = setup((url, options) => {
    calls++;
    assert.equal(url, 'https://formspree.io/f/mrppdynn');
    assert.equal(options.headers.Accept, 'application/json');
    assert.deepEqual(JSON.parse(options.body), {email:'test@example.com', purpose:'Security research', message:'Local test'});
    return new Promise(resolve => { finish = resolve; });
  });
  const pending = success.submit();
  assert.equal(success.nodes['contact-send'].disabled, true);
  await success.submit();
  assert.equal(calls, 1, 'Concurrent submit must not send twice');
  finish({ok:true}); await pending;
  assert.equal(success.nodes['contact-email'].value, '');
  assert.equal(success.nodes['contact-send'].disabled, false);
  assert.match(success.nodes['contact-status'].textContent, /successfully/);
  for (const code of [422,429,500]) {
    const test = setup(async () => ({ok:false,status:code}));
    await test.submit();
    assert.equal(test.nodes['contact-message'].value, 'Local test');
    assert.equal(test.nodes['contact-send'].disabled, false);
    assert.doesNotMatch(test.nodes['contact-status'].textContent, /successfully/);
  }
  const offline = setup(async () => {throw new Error('offline');});
  await offline.submit();
  assert.equal(offline.nodes['contact-message'].value, 'Local test');
  assert.match(offline.nodes['contact-status'].textContent, /could not be confirmed/);
  const invalid = setup(() => {throw new Error('Invalid form must not send');});
  invalid.nodes['contact-email'].value = '';
  await invalid.submit();
  assert.match(invalid.nodes['contact-status'].textContent, /valid email/);
  for (const settings of [{}, {unavailable:true}, {token:'expired'}]) {
    let requests = 0;
    const test = setup(async () => { requests++; return {ok:true}; }, settings);
    if (settings.token) settings.callbacks['expired-callback']();
    await test.submit();
    assert.equal(requests, 0, 'Missing, unavailable or expired CAPTCHA must block fetch');
    assert.match(test.nodes['contact-status'].textContent, /anti-spam/);
  }
  for (const ok of [true, false]) {
    const settings = {token:'test-token'};
    const test = setup(async (url, options) => {
      assert.equal(JSON.parse(options.body)['cf-turnstile-response'], 'test-token');
      return {ok,status:422};
    }, settings);
    await test.submit();
    assert.equal(settings.resets, 1, 'Token must be reset after success or rejection');
    assert.equal(test.nodes['contact-send'].disabled, false);
  }
  console.log('PASS: payload, success/reset, concurrent submit, HTTP errors, network failure and validation. No real messages sent.');
})().catch(error => { console.error(error); process.exitCode = 1; });

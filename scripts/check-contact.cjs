// Isolated form behavior tests: no network calls or real messages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/main.js', 'utf8');
const contact = source.slice(source.indexOf('// contact form'), source.indexOf('// site views counter'));
function setup(fetch) {
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
  vm.runInNewContext(contact, { document: {getElementById: id => nodes[id], addEventListener() {}}, window: {matchMedia: () => ({matches:true})}, fetch, AbortController, setTimeout, clearTimeout, setInterval, clearInterval });
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
  console.log('PASS: payload, success/reset, concurrent submit, HTTP errors, network failure and validation. No real messages sent.');
})().catch(error => { console.error(error); process.exitCode = 1; });

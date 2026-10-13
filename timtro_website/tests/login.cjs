// Run with: node tests/login.cjs
// Execute the real inline script with a small DOM and mocked Supabase; no emails are sent.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const user = { id: 'student-1', email: 'student@st.ueh.edu.vn' };
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

function element(attrs = {}) {
  const classes = new Set((attrs.class || '').split(/\s+/).filter(Boolean));
  const listeners = {};
  return {
    attrs, value: attrs.value || '', textContent: '', innerHTML: '', style: {},
    dataset: Object.fromEntries(Object.entries(attrs).filter(([k]) => k.startsWith('data-')).map(([k,v]) => [k.slice(5), v])),
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c), toggle(c, enabled = !classes.has(c)) { enabled ? classes.add(c) : classes.delete(c); return enabled; } },
    setAttribute(k, v) { attrs[k] = v; },
    addEventListener(k, fn) { (listeners[k] ||= []).push(fn); },
    async fire(k) { for (const fn of listeners[k] || []) await fn({ preventDefault() {}, submitter: this }); },
    focus() {}, click() {},
  };
}
async function boot(options = {}) {
  const nodes = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(match => {
    const attrs = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(a => [a[1],a[2]]));
    return { tag: match[1], ...element(attrs) };
  });
  const ids = new Map(nodes.filter(n => n.attrs.id).map(n => [n.attrs.id, n]));
  assert.equal(ids.size, nodes.filter(n => n.attrs.id).length, 'No duplicate HTML IDs');
  const body = nodes.find(n => n.tag === 'body');
  const queryAll = s => {
    if (s === 'main section') return nodes.filter(n => n.tag === 'section');
    if (s === '.nav button') return nodes.filter(n => n.tag === 'button' && n.dataset.page);
    if (s.includes('[data-lifestyle]')) return nodes.filter(n => n.attrs['data-lifestyle'] && (!s.endsWith('.selected') || n.classList.contains('selected')));
    if (s.startsWith('#')) return ids.has(s.slice(1)) ? [ids.get(s.slice(1))] : [];
    const data = s.match(/^\[data-page="([^"]+)"\]$/);
    if (data) return nodes.filter(n => n.dataset.page === data[1]);
    throw new Error('Unsupported selector in test: ' + s);
  };
  let authCallback;
  const calls = [];
  const auth = {
    async getSession() { return { data: { session: options.session || null }, error: options.sessionError || null }; },
    onAuthStateChange(fn) { authCallback = fn; return {}; },
    async signInWithPassword(payload) { calls.push(['login', payload]); return options.loginError ? { error: options.loginError } : { data: { user }, error: null }; },
    async signUp(payload) { calls.push(['signup', payload]); return { data: { user, session: options.autoConfirm ? { user } : null }, error: null }; },
    async verifyOtp(payload) { calls.push(['verify', payload]); return options.otpError ? { error: options.otpError } : { data: { user }, error: null }; },
    async resend(payload) { calls.push(['resend', payload]); return { error: null }; },
    async signOut() { calls.push(['logout']); if (options.logoutError) return { error: options.logoutError }; authCallback('SIGNED_OUT', null); return { error: null }; },
  };
  const storage = new Map([['timtro_selected_role', 'host']]);
  const window = { scrollTo() {}, location: { origin: 'https://example.test' }, supabase: options.noLibrary ? null : { createClient: () => ({ auth }) } };
  const context = vm.createContext({ window, document: { body, querySelector: s => queryAll(s)[0] || null, querySelectorAll: queryAll, addEventListener() {} }, localStorage: { getItem: k => storage.get(k) || null }, sessionStorage: { getItem: k => storage.get(k) || null }, setTimeout: () => 1, clearTimeout() {}, console });
  vm.runInContext(script, context);
  await flush();
  return { node: id => ids.get(id), body, calls, context, authEvent: (event, session) => authCallback(event, session) };
}
function loginVisible(app) {
  assert(app.body.classList.contains('auth-pending'));
  assert(!app.node('authGate').classList.contains('hidden'));
  assert.equal(app.node('loginTab').attrs['aria-pressed'], 'true');
}
function homeVisible(app) {
  assert(!app.body.classList.contains('auth-pending'));
  assert(app.node('authGate').classList.contains('hidden'));
  assert(!app.node('homePage').classList.contains('hidden'));
}
function credentials(app, email = user.email) {
  app.node('authEmail').value = email;
  app.node('authPassword').value = 'test-password';
  app.node('authUsername').value = 'Student';
}
(async () => {
  assert(!/roleGate|backToRole|switchRole|hostPage|selectedRole|showRoleChoice|chooseRole/.test(html));
  assert(/<span class="forgot-password" aria-disabled="true"/.test(html));
  assert(!/resetPasswordForEmail/.test(script));
  const app = await boot();
  loginVisible(app); // Includes obsolete stored host role: it cannot bypass login.
  assert(!app.node('forgotPasswordWrap').classList.contains('hidden'));
  assert(app.node('usernameWrap').classList.contains('hidden'));
  assert(app.node('featuredRooms').innerHTML.includes('room-card'));
  await app.node('signupTab').fire('click');
  assert(app.node('forgotPasswordWrap').classList.contains('hidden'));
  assert(!app.node('usernameWrap').classList.contains('hidden'));
  assert.equal(app.node('authPassword').autocomplete, 'new-password');
  credentials(app);
  await app.node('authForm').fire('submit');
  assert(app.node('authForm').classList.contains('hidden'));
  assert(!app.node('otpForm').classList.contains('hidden'));
  assert.equal(app.calls[0][0], 'signup');
  assert.equal(app.calls[0][1].options.data.username, 'Student');
  app.node('authOtp').value = 'bad';
  await app.node('otpForm').fire('submit');
  assert.equal(app.calls.length, 1);
  await app.node('resendOtp').fire('click');
  assert.equal(app.calls[1][0], 'resend');
  app.node('authOtp').value = '123456';
  await app.node('otpForm').fire('submit');
  homeVisible(app);
  await app.node('logoutBtn').fire('click');
  loginVisible(app);
  assert.equal(app.node('authPassword').value, '');
  assert.equal(app.node('authOtp').value, '');
  assert.equal(app.node('signedInEmail').textContent, '');
  credentials(app, 'student@example.com');
  const before = app.calls.length;
  await app.node('authForm').fire('submit');
  assert.equal(app.calls.length, before, 'Reject non-UEH email before any API call');
  credentials(app);
  await app.node('authForm').fire('submit');
  homeVisible(app);
  app.authEvent('SIGNED_OUT', null);
  loginVisible(app);
  homeVisible(await boot({ session: { user } }));
  loginVisible(await boot({ session: { user: { id: 'other', email: 'other@example.com' } } }));
  const missing = await boot({ noLibrary: true });
  loginVisible(missing);
  assert(missing.node('authMessage').textContent.includes('Supabase'));
  const sessionFailure = await boot({ sessionError: { message: 'Network error' } });
  loginVisible(sessionFailure);
  assert(sessionFailure.node('authMessage').textContent.includes('phiên đăng nhập'));
  const failed = await boot({ loginError: { message: 'Invalid login credentials' } });
  credentials(failed);
  await failed.node('authForm').fire('submit');
  loginVisible(failed);
  assert(failed.node('authMessage').textContent.includes('Invalid login credentials'));
  assert.equal(failed.node('sendAuth').disabled, false);
  const signoutFailure = await boot({ session: { user }, logoutError: { message: 'Network error' } });
  await signoutFailure.node('logoutBtn').fire('click');
  homeVisible(signoutFailure);
  const verified = await boot({ autoConfirm: true });
  await verified.node('signupTab').fire('click');
  credentials(verified);
  await verified.node('authForm').fire('submit');
  homeVisible(verified);
  const expired = await boot({ otpError: { message: 'Code expired' } });
  await expired.node('signupTab').fire('click');
  credentials(expired);
  await expired.node('authForm').fire('submit');
  expired.node('authOtp').value = '123456';
  await expired.node('otpForm').fire('submit');
  assert(!expired.node('authGate').classList.contains('hidden'));
  assert(!expired.node('otpForm').classList.contains('hidden'));
  assert(expired.node('authMessage').textContent.includes('Code expired'));
  console.log('PASS: script syntax, HTML IDs, student-only entry, tabs, display-only forgot password, signup, OTP validation/resend/success/failure, login validation/success/failure, session restore, auth events, logout and service errors (mocked DOM/Supabase).');
})().catch(error => { console.error(error); process.exitCode = 1; });

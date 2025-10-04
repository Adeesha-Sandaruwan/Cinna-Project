// Simple shared API utility
// Uses relative /api paths so devServer proxy works; override with REACT_APP_API_URL if needed
const API_BASE = process.env.REACT_APP_API_URL || '';

function buildUrl(path) {
  if (/^https?:/i.test(path)) return path;
  if (path.startsWith('/api')) return `${API_BASE}${path}`;
  return `${API_BASE}/api${path.startsWith('/') ? path : `/${path}`}`;
}

export async function safeRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body !== undefined) opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  let res;
  try {
    res = await fetch(buildUrl(path), opts);
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  let data = null;
  if (contentType.includes('application/json')) {
    try { data = JSON.parse(text); } catch { throw new Error(`Invalid JSON response (${res.status})`); }
  } else {
    // Non JSON server response
    const snippet = text.slice(0,120).replace(/\s+/g,' ');
    if (!res.ok) throw new Error(`HTTP ${res.status} (non-JSON): ${snippet}`);
    throw new Error(`Unexpected non-JSON response (HTTP ${res.status})`);
  }
  return { res, data };
}

export function isOk(res) { return res && res.ok; }

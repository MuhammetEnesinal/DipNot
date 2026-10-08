const BLOCKED_HOSTS = new Set(['chromewebstore.google.com']);

export function isSupportedPage(url: string | undefined): boolean {
  if (!url) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
  if (BLOCKED_HOSTS.has(parsed.hostname)) return false;
  if (parsed.hostname === 'chrome.google.com' && parsed.pathname.startsWith('/webstore')) return false;
  if (parsed.pathname.toLowerCase().endsWith('.pdf')) return false;

  return true;
}

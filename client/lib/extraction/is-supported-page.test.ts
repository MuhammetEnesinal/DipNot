import { describe, expect, it } from 'vitest';
import { isSupportedPage } from './is-supported-page';

describe('isSupportedPage', () => {
  it.each([
    'https://example.com/makale',
    'http://example.com/',
    'https://example.com/a.pdf.html',
  ])('%s desteklenir', (url) => {
    expect(isSupportedPage(url)).toBe(true);
  });

  it.each([
    undefined,
    '',
    'bozuk adres',
    'chrome://extensions',
    'chrome-extension://abc/page.html',
    'file:///C:/rapor.pdf',
    'about:blank',
    'https://chromewebstore.google.com/detail/x',
    'https://chrome.google.com/webstore/detail/x',
    'https://example.com/belge.PDF',
  ])('%s desteklenmez', (url) => {
    expect(isSupportedPage(url)).toBe(false);
  });
});

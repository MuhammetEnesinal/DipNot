// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { extractSource } from './extract-source';

const PARAGRAPH =
  'Bu paragraf, Readability tarafından ana içerik olarak algılanacak kadar uzun bir cümleden oluşur ve sayfanın asıl metnini temsil eder.';

function loadPage(bodyHtml: string): void {
  document.documentElement.lang = 'tr';
  document.title = 'Deneme';
  document.body.innerHTML = bodyHtml;
}

describe('extractSource', () => {
  it('tüm sayfada menüyü ayıklayıp ana metni pasajlara böler', () => {
    loadPage(`
      <nav><a href="/">Anasayfa</a><a href="/iletisim">İletişim</a></nav>
      <article>
        <h1>Makale</h1>
        <p>${PARAGRAPH}</p>
        <p>${PARAGRAPH} İkincisi.</p>
        <p>${PARAGRAPH} Üçüncüsü.</p>
      </article>`);

    const result = extractSource('page', document, window);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mode).toBe('page');
    expect(result.source.lang).toBe('tr');
    expect(result.source.passages.length).toBeGreaterThanOrEqual(3);
    expect(result.source.passages.map((p) => p.text).join(' ')).not.toContain('İletişim');
  });

  it('seçimde yalnızca seçili metni alır', () => {
    loadPage(`<p id="a">${PARAGRAPH}</p><p id="b">Seçilmeyen paragraf.</p>`);
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('a')!);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);

    const result = extractSource('selection', document, window);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.source.mode).toBe('selection');
    expect(result.source.passages).toEqual([{ id: 'p1', text: PARAGRAPH }]);
  });

  it('metin yoksa empty döner', () => {
    loadPage('');
    window.getSelection()!.removeAllRanges();

    expect(extractSource('selection', document, window)).toEqual({ ok: false, reason: 'empty' });
  });
});

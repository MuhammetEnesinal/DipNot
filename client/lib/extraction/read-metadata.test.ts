// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { readMetadata } from './read-metadata';

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

const PAGE_URL = 'https://example.com/makale?utm=1';

describe('readMetadata', () => {
  it('meta etiketlerinden künyeyi okur', () => {
    const doc = parse(`
      <html lang="tr"><head>
        <title>Sayfa başlığı</title>
        <meta property="og:title" content="OG başlığı">
        <meta property="og:site_name" content="Örnek Site">
        <meta name="author" content="Ayşe Yılmaz">
        <meta property="article:published_time" content="2025-03-14T10:00:00Z">
        <link rel="canonical" href="https://example.com/makale">
      </head><body></body></html>`);

    expect(readMetadata(doc, PAGE_URL)).toEqual({
      url: 'https://example.com/makale',
      title: 'OG başlığı',
      siteName: 'Örnek Site',
      author: 'Ayşe Yılmaz',
      publishedAt: '2025-03-14T10:00:00Z',
      lang: 'tr',
    });
  });

  it('meta yoksa başlığı ve adresi sayfadan alır', () => {
    const doc = parse('<html><head><title>Yalın sayfa</title></head><body></body></html>');

    expect(readMetadata(doc, PAGE_URL)).toEqual({
      url: PAGE_URL,
      title: 'Yalın sayfa',
      siteName: undefined,
      author: undefined,
      publishedAt: undefined,
      lang: undefined,
    });
  });

  it('yazar ve tarihi JSON-LD içinden okur', () => {
    const doc = parse(`
      <html><head><title>x</title>
        <script type="application/ld+json">
          {"@graph":[{"@type":"Article","datePublished":"2024-01-02",
            "author":[{"name":"A. Kaya"},{"name":"B. Demir"}]}]}
        </script>
      </head><body></body></html>`);

    const metadata = readMetadata(doc, PAGE_URL);

    expect(metadata.author).toBe('A. Kaya, B. Demir');
    expect(metadata.publishedAt).toBe('2024-01-02');
  });

  it('bozuk JSON-LD yüzünden hata vermez', () => {
    const doc = parse(`<html><head><title>x</title>
      <script type="application/ld+json">{bozuk</script></head><body></body></html>`);

    expect(readMetadata(doc, PAGE_URL).title).toBe('x');
  });

  it('başka siteye işaret eden canonical adresi yok sayar', () => {
    const doc = parse(`<html><head><title>x</title>
      <link rel="canonical" href="https://baska-site.com/makale"></head><body></body></html>`);

    expect(readMetadata(doc, PAGE_URL).url).toBe(PAGE_URL);
  });
});

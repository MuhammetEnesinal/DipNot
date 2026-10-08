type Metadata = {
  url: string;
  title: string;
  siteName?: string;
  author?: string;
  publishedAt?: string;
  lang?: string;
};

type JsonLdNode = Record<string, unknown>;

function metaContent(doc: Document, selector: string): string | undefined {
  const value = doc.querySelector<HTMLMetaElement>(selector)?.content.trim();
  return value || undefined;
}

function readJsonLdNodes(doc: Document): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];

  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data: unknown = JSON.parse(script.textContent ?? '');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item && typeof item === 'object') {
          const node = item as JsonLdNode;
          const graph = node['@graph'];
          nodes.push(node, ...(Array.isArray(graph) ? (graph as JsonLdNode[]) : []));
        }
      }
    } catch {
      continue;
    }
  }

  return nodes;
}

function authorName(author: unknown): string | undefined {
  if (typeof author === 'string') return author.trim() || undefined;
  if (Array.isArray(author)) {
    const names = author.map(authorName).filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(', ') : undefined;
  }
  if (author && typeof author === 'object') {
    return authorName((author as JsonLdNode).name);
  }
  return undefined;
}

function firstJsonLdValue<T>(nodes: JsonLdNode[], read: (node: JsonLdNode) => T | undefined): T | undefined {
  for (const node of nodes) {
    const value = read(node);
    if (value !== undefined) return value;
  }
  return undefined;
}

function resolveUrl(doc: Document, pageUrl: string): string {
  const canonical = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  if (!canonical) return pageUrl;

  try {
    const parsed = new URL(canonical);
    const sameHost = parsed.hostname === new URL(pageUrl).hostname;
    const isWeb = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    return sameHost && isWeb ? parsed.href : pageUrl;
  } catch {
    return pageUrl;
  }
}

export function readMetadata(doc: Document, pageUrl: string): Metadata {
  const nodes = readJsonLdNodes(doc);

  return {
    url: resolveUrl(doc, pageUrl),
    title: metaContent(doc, 'meta[property="og:title"]') ?? (doc.title.trim() || pageUrl),
    siteName: metaContent(doc, 'meta[property="og:site_name"]'),
    author: metaContent(doc, 'meta[name="author"]') ?? firstJsonLdValue(nodes, (node) => authorName(node.author)),
    publishedAt:
      metaContent(doc, 'meta[property="article:published_time"]') ??
      firstJsonLdValue(nodes, (node) =>
        typeof node.datePublished === 'string' ? node.datePublished : undefined,
      ),
    lang: doc.documentElement.lang.trim() || undefined,
  };
}

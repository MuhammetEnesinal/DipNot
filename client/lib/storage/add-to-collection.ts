import type { ExtractedSource, Passage, Source } from '@/types/source';

export const MAX_SOURCES = 10;
export const MAX_SOURCE_CHARS = 30_000;
export const MAX_FIELD_CHARS = 300;

export type AddStatus = 'added' | 'updated' | 'unchanged' | 'full';

type AddResult = {
  collection: Source[];
  status: AddStatus;
  source?: Source;
};

function withoutHash(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.href;
  } catch {
    return url;
  }
}

function clamp(value: string | undefined): string | undefined {
  return value?.slice(0, MAX_FIELD_CHARS);
}

function normalize(incoming: ExtractedSource): ExtractedSource {
  return {
    ...incoming,
    url: withoutHash(incoming.url),
    pageUrl: incoming.pageUrl && withoutHash(incoming.pageUrl),
    title: incoming.title.slice(0, MAX_FIELD_CHARS),
    siteName: clamp(incoming.siteName),
    author: clamp(incoming.author),
  };
}

function limitLength(passages: Passage[]): { passages: Passage[]; truncated: boolean } {
  const kept: Passage[] = [];
  let total = 0;

  for (const passage of passages) {
    const remaining = MAX_SOURCE_CHARS - total;
    if (remaining <= 0) return { passages: kept, truncated: true };

    if (passage.text.length > remaining) {
      kept.push({ ...passage, text: passage.text.slice(0, remaining) });
      return { passages: kept, truncated: true };
    }

    kept.push(passage);
    total += passage.text.length;
  }

  return { passages: kept, truncated: false };
}

function mergeSelections(existing: Source, incoming: ExtractedSource): Source | undefined {
  const known = new Set(existing.passages.map((passage) => passage.text));
  const fresh = incoming.passages.filter((passage) => {
    if (known.has(passage.text)) return false;
    known.add(passage.text);
    return true;
  });
  if (fresh.length === 0) return undefined;

  const numbered = fresh.map((passage, index) => ({
    id: `p${existing.passages.length + index + 1}`,
    text: passage.text,
  }));
  const limited = limitLength([...existing.passages, ...numbered]);

  const added = limited.passages.length > existing.passages.length;
  const truncated = existing.truncated || limited.truncated;
  if (!added && truncated === existing.truncated) return undefined;

  return { ...existing, passages: limited.passages, truncated };
}

function hasSameContent(a: Source, b: Source): boolean {
  return (
    a.mode === b.mode &&
    a.title === b.title &&
    a.siteName === b.siteName &&
    a.author === b.author &&
    a.publishedAt === b.publishedAt &&
    a.lang === b.lang &&
    a.truncated === b.truncated &&
    a.passages.length === b.passages.length &&
    a.passages.every((passage, index) => passage.text === b.passages[index]?.text)
  );
}

function replaceContent(existing: Source, incoming: ExtractedSource): Source {
  const limited = limitLength(incoming.passages);
  return { ...incoming, id: existing.id, addedAt: existing.addedAt, ...limited };
}

export function findSourceByAddress(collection: Source[], address: string): Source | undefined {
  const key = withoutHash(address);
  return collection.find(
    (source) => withoutHash(source.url) === key || (source.pageUrl && withoutHash(source.pageUrl) === key),
  );
}

export function addToCollection(collection: Source[], rawIncoming: ExtractedSource): AddResult {
  const incoming = normalize(rawIncoming);
  const index = collection.findIndex((source) => withoutHash(source.url) === incoming.url);
  const existing = collection[index];

  if (!existing) {
    if (collection.length >= MAX_SOURCES) return { collection, status: 'full' };

    const limited = limitLength(incoming.passages);
    const source: Source = {
      ...incoming,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      ...limited,
    };
    return { collection: [...collection, source], status: 'added', source };
  }

  let updated: Source | undefined;

  if (incoming.mode === 'page') {
    updated = replaceContent(existing, incoming);
  } else if (existing.mode === 'selection') {
    updated = mergeSelections(existing, incoming);
  }

  if (!updated || hasSameContent(existing, updated)) {
    return { collection, status: 'unchanged', source: existing };
  }

  const next = [...collection];
  next[index] = updated;
  return { collection: next, status: 'updated', source: updated };
}

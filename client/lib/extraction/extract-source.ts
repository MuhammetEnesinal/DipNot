import { Readability } from '@mozilla/readability';
import type { ExtractionResult, SourceMode } from '@/types/source';
import { readMetadata } from './read-metadata';
import { splitPassages } from './split-passages';

const BLOCK_SELECTOR = 'p, li, blockquote, pre, h1, h2, h3, h4, h5, h6';

function readPageParagraphs(doc: Document): string[] {
  const article = new Readability(doc.cloneNode(true) as Document).parse();
  if (!article?.content) return [];

  const inert = new DOMParser().parseFromString(article.content, 'text/html');
  return [...inert.querySelectorAll(BLOCK_SELECTOR)]
    .filter((element) => element.querySelector(BLOCK_SELECTOR) === null)
    .map((element) => element.textContent ?? '');
}

function readSelectionParagraphs(win: Window): string[] {
  return (win.getSelection()?.toString() ?? '').split(/\n+/);
}

export function extractSource(mode: SourceMode, doc: Document, win: Window): ExtractionResult {
  if (doc.contentType === 'application/pdf') return { ok: false, reason: 'unsupported' };

  const paragraphs = mode === 'selection' ? readSelectionParagraphs(win) : readPageParagraphs(doc);
  const passages = splitPassages(paragraphs);
  if (passages.length === 0) return { ok: false, reason: 'empty' };

  return {
    ok: true,
    source: { ...readMetadata(doc, win.location.href), mode, passages },
  };
}

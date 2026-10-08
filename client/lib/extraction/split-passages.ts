import type { Passage } from '@/types/source';

const MIN_PASSAGE_LENGTH = 80;

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function splitPassages(paragraphs: string[]): Passage[] {
  const texts: string[] = [];
  let pending = '';

  for (const paragraph of paragraphs) {
    const clean = normalizeWhitespace(paragraph);
    if (!clean) continue;

    pending = pending ? `${pending} ${clean}` : clean;
    if (pending.length >= MIN_PASSAGE_LENGTH) {
      texts.push(pending);
      pending = '';
    }
  }

  if (pending) {
    if (texts.length > 0) texts[texts.length - 1] += ` ${pending}`;
    else texts.push(pending);
  }

  return texts.map((text, index) => ({ id: `p${index + 1}`, text }));
}

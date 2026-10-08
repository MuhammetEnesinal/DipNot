export type Passage = {
  id: string;
  text: string;
};

export type SourceMode = 'page' | 'selection';

export type ExtractedSource = {
  url: string;
  title: string;
  siteName?: string;
  author?: string;
  publishedAt?: string;
  lang?: string;
  mode: SourceMode;
  passages: Passage[];
};

export type ExtractionResult =
  | { ok: true; source: ExtractedSource }
  | { ok: false; reason: 'unsupported' | 'empty' };

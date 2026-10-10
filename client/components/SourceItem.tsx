import type { Source } from '@/types/source';

type SourceItemProps = {
  source: Source;
  onRemove: (id: string) => void;
};

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function describeContent(source: Source): string {
  return source.mode === 'page' ? 'Tüm sayfa' : `Seçim, ${source.passages.length} pasaj`;
}

export default function SourceItem({ source, onRemove }: SourceItemProps) {
  return (
    <li className="flex items-start gap-2 rounded-md border border-gray-200 p-2">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium">{source.title}</p>
        <p className="truncate text-xs text-gray-500">{source.siteName ?? hostOf(source.url)}</p>
        <p className="text-xs text-gray-500">
          {describeContent(source)}
          {source.truncated && ' · kısaltıldı'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(source.id)}
        aria-label={`${source.title} kaynağını çıkar`}
        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        Çıkar
      </button>
    </li>
  );
}

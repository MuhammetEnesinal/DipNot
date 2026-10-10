import type { Source } from '@/types/source';
import SourceItem from './SourceItem';

type SourceListProps = {
  sources: Source[];
  onRemove: (id: string) => void;
};

export default function SourceList({ sources, onRemove }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <p className="rounded-md bg-gray-50 p-3 text-gray-600">
        Henüz kaynak yok. Bir sayfada sağ tıklayıp "Sayfayı rapora ekle" deyin ya da metni seçip "Seçimi
        rapora ekle" deyin.
      </p>
    );
  }

  return (
    <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
      {sources.map((source) => (
        <SourceItem key={source.id} source={source} onRemove={onRemove} />
      ))}
    </ul>
  );
}

import { storage } from 'wxt/utils/storage';
import type { ExtractedSource, Source } from '@/types/source';
import { addToCollection, type AddStatus } from './add-to-collection';

export type AddOutcome = {
  status: AddStatus;
  count: number;
  source?: Source;
};

const LOCK_NAME = 'dipnot-collection';

const collectionItem = storage.defineItem<Source[]>('local:collection', { fallback: [] });

export function getCollection(): Promise<Source[]> {
  return collectionItem.getValue();
}

export function watchCollection(onChange: (collection: Source[]) => void): () => void {
  return collectionItem.watch((collection) => onChange(collection ?? []));
}

// Popup ve arka plan aynı anda yazabildiği için okuma-değiştirme-yazma adımı kilitle sıralanır.
function withLock<T>(task: () => Promise<T>): Promise<T> {
  return navigator.locks.request(LOCK_NAME, task) as Promise<T>;
}

export function addSource(incoming: ExtractedSource): Promise<AddOutcome> {
  return withLock(async () => {
    const result = addToCollection(await getCollection(), incoming);
    if (result.status === 'added' || result.status === 'updated') {
      await collectionItem.setValue(result.collection);
    }
    return { status: result.status, count: result.collection.length, source: result.source };
  });
}

export function removeSource(id: string): Promise<void> {
  return withLock(async () => {
    const collection = await getCollection();
    const remaining = collection.filter((source) => source.id !== id);
    if (remaining.length !== collection.length) await collectionItem.setValue(remaining);
  });
}

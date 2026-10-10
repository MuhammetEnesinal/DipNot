import { useEffect, useState } from 'react';
import type { Source } from '@/types/source';
import { getCollection, watchCollection } from './collection-store';

export function useCollection(): Source[] | undefined {
  const [collection, setCollection] = useState<Source[]>();

  useEffect(() => {
    let changedSinceRead = false;

    void getCollection().then((initial) => {
      if (!changedSinceRead) setCollection(initial);
    });
    const unwatch = watchCollection((latest) => {
      changedSinceRead = true;
      setCollection(latest);
    });

    return unwatch;
  }, []);

  return collection;
}

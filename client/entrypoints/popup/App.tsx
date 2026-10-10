import { useEffect, useState } from 'react';
import SourceList from '@/components/SourceList';
import { FAILED_FEEDBACK, UNSUPPORTED_FEEDBACK } from '@/lib/feedback/describe-outcome';
import { isSupportedPage } from '@/lib/extraction/is-supported-page';
import { MAX_SOURCES, findSourceByAddress } from '@/lib/storage/add-to-collection';
import { removeSource } from '@/lib/storage/collection-store';
import { useCollection } from '@/lib/storage/use-collection';
import type { Feedback } from '@/types/feedback';
import { isAddActivePageResponse, type AddActivePageMessage } from '@/types/messages';

const FEEDBACK_STYLES: Record<Feedback['kind'], string> = {
  success: 'text-green-700',
  info: 'text-blue-700',
  warning: 'text-red-600',
};

function useActiveTab(): Browser.tabs.Tab | undefined {
  const [tab, setTab] = useState<Browser.tabs.Tab>();

  useEffect(() => {
    void browser.tabs.query({ active: true, currentWindow: true }).then(([active]) => setTab(active));
  }, []);

  return tab;
}

export default function App() {
  const collection = useCollection();
  const activeTab = useActiveTab();
  const [feedback, setFeedback] = useState<Feedback>();
  const [busy, setBusy] = useState(false);

  if (!collection) return null;

  const tabId = activeTab?.id;
  const supported = tabId !== undefined && isSupportedPage(activeTab?.url);
  const existing = activeTab?.url ? findSourceByAddress(collection, activeTab.url) : undefined;
  const isFull = collection.length >= MAX_SOURCES;

  let blockedReason: string | undefined;
  if (!supported) {
    blockedReason = UNSUPPORTED_FEEDBACK.text;
  } else if (isFull && !existing) {
    blockedReason = `Kaynak sınırı doldu (${collection.length}/${MAX_SOURCES}). Yeni sayfa eklemek için bir kaynağı çıkarın.`;
  }

  const hint = blockedReason ?? (existing ? 'Bu sayfa zaten ekli. Yeniden eklerseniz içerik güncellenir.' : undefined);

  async function addActivePage() {
    if (tabId === undefined) return;
    const message: AddActivePageMessage = { type: 'add-active-page', tabId };

    setBusy(true);
    try {
      const response: unknown = await browser.runtime.sendMessage(message);
      setFeedback(isAddActivePageResponse(response) ? response.feedback : FAILED_FEEDBACK);
    } catch {
      setFeedback(FAILED_FEEDBACK);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-col gap-3 bg-white p-4 text-sm text-gray-900">
      <header className="flex items-center justify-between">
        <h1 className="text-base font-semibold">DipNot</h1>
        <span className="text-xs text-gray-500">
          {collection.length} / {MAX_SOURCES} kaynak
        </span>
      </header>

      {blockedReason && (
        <p role="alert" className="rounded-md bg-amber-50 p-3 text-xs font-medium text-amber-900">
          {blockedReason}
        </p>
      )}

      <SourceList sources={collection} onRemove={(id) => void removeSource(id)} />

      <span title={hint} className="block">
        <button
          type="button"
          onClick={() => void addActivePage()}
          disabled={blockedReason !== undefined || busy}
          className="w-full rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {existing ? 'Bu sayfayı güncelle' : 'Bu sayfayı ekle'}
        </button>
      </span>

      {feedback && (
        <p role="status" className={`text-xs ${FEEDBACK_STYLES[feedback.kind]}`}>
          {feedback.text}
        </p>
      )}
    </main>
  );
}

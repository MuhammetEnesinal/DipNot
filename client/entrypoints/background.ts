import {
  EMPTY_FEEDBACK,
  SAVE_ERROR_FEEDBACK,
  UNSUPPORTED_FEEDBACK,
  describeOutcome,
} from '@/lib/feedback/describe-outcome';
import { showToast } from '@/lib/feedback/show-toast';
import { isSupportedPage } from '@/lib/extraction/is-supported-page';
import { MAX_SOURCES } from '@/lib/storage/add-to-collection';
import { addSource, getCollection, watchCollection } from '@/lib/storage/collection-store';
import type { Feedback } from '@/types/feedback';
import { isAddActivePageMessage, type AddActivePageResponse } from '@/types/messages';
import type { ExtractionResult, SourceMode } from '@/types/source';

const MENU_ADD_PAGE = 'add-page';
const MENU_ADD_SELECTION = 'add-selection';
const FLASH_DURATION_MS = 3000;
const COUNT_COLOR = '#1a73e8';
const WARNING_COLOR = '#d93025';

const EXTRACTOR_FILES: Record<SourceMode, '/extract-page.js' | '/extract-selection.js'> = {
  page: '/extract-page.js',
  selection: '/extract-selection.js',
};

export default defineBackground(() => {
  const menusReady = getCollection()
    .then((collection) => collection.length)
    .catch(() => 0)
    .then(createMenus);

  void refreshBadge();

  browser.contextMenus.onClicked.addListener(handleMenuClick);
  browser.runtime.onMessage.addListener(handleMessage);
  watchCollection((collection) => {
    showCount(collection.length);
    void menusReady.then(() => updateMenuTitles(collection.length));
  });
});

function menuTitle(label: string, count: number): string {
  return count >= MAX_SOURCES ? `${label} (${count}/${MAX_SOURCES} dolu)` : `${label} (${count}/${MAX_SOURCES})`;
}

function createMenus(count: number): Promise<void> {
  return new Promise((resolve) => {
    browser.contextMenus.removeAll(() => {
      void browser.runtime.lastError;
      browser.contextMenus.create({
        id: MENU_ADD_PAGE,
        title: menuTitle('Sayfayı rapora ekle', count),
        contexts: ['page', 'selection'],
      });
      browser.contextMenus.create(
        {
          id: MENU_ADD_SELECTION,
          title: menuTitle('Seçimi rapora ekle', count),
          contexts: ['selection'],
        },
        () => {
          void browser.runtime.lastError;
          resolve();
        },
      );
    });
  });
}

function updateMenuTitles(count: number) {
  browser.contextMenus
    .update(MENU_ADD_PAGE, { title: menuTitle('Sayfayı rapora ekle', count) })
    .catch(() => undefined);
  browser.contextMenus
    .update(MENU_ADD_SELECTION, { title: menuTitle('Seçimi rapora ekle', count) })
    .catch(() => undefined);
}

async function handleMenuClick(info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) {
  const mode: SourceMode = info.menuItemId === MENU_ADD_SELECTION ? 'selection' : 'page';
  const feedback = await addFromTab(tab, mode);

  const shown = tab?.id !== undefined && (await showToastInTab(tab.id, feedback));
  if (shown || feedback.kind !== 'warning') return;

  flashBadge('!', WARNING_COLOR);
  await openPopup();
}

async function openPopup(): Promise<void> {
  try {
    await browser.action.openPopup();
  } catch {
    // Popup açılamazsa ikondaki uyarı rozeti yeterlidir.
  }
}

function handleMessage(
  message: unknown,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response: AddActivePageResponse) => void,
) {
  if (sender.id !== browser.runtime.id || !isAddActivePageMessage(message)) return false;

  browser.tabs
    .get(message.tabId)
    .then((tab) => addFromTab(tab, 'page'))
    .catch((): Feedback => UNSUPPORTED_FEEDBACK)
    .then((feedback) => sendResponse({ feedback }));

  return true;
}

async function addFromTab(tab: Browser.tabs.Tab | undefined, mode: SourceMode): Promise<Feedback> {
  if (!tab?.id || !isSupportedPage(tab.url)) return UNSUPPORTED_FEEDBACK;

  const result = await extract(tab.id, mode);
  if (!result) return UNSUPPORTED_FEEDBACK;
  if (!result.ok) return result.reason === 'empty' ? EMPTY_FEEDBACK : UNSUPPORTED_FEEDBACK;

  try {
    return describeOutcome(await addSource(result.source), mode);
  } catch {
    return SAVE_ERROR_FEEDBACK;
  }
}

async function extract(tabId: number, mode: SourceMode): Promise<ExtractionResult | undefined> {
  try {
    const [injection] = await browser.scripting.executeScript({
      target: { tabId },
      files: [EXTRACTOR_FILES[mode]],
    });
    return injection?.result as ExtractionResult | undefined;
  } catch {
    return undefined;
  }
}

async function showToastInTab(tabId: number, feedback: Feedback): Promise<boolean> {
  try {
    await browser.scripting.executeScript({
      target: { tabId },
      func: showToast,
      args: [feedback.text, feedback.kind],
    });
    return true;
  } catch {
    return false;
  }
}

async function refreshBadge() {
  showCount((await getCollection()).length);
}

function showCount(count: number) {
  void browser.action.setBadgeBackgroundColor({ color: COUNT_COLOR });
  void browser.action.setBadgeText({ text: count > 0 ? String(count) : '' });
}

function flashBadge(text: string, color: string) {
  void browser.action.setBadgeBackgroundColor({ color });
  void browser.action.setBadgeText({ text });
  setTimeout(() => void refreshBadge(), FLASH_DURATION_MS);
}

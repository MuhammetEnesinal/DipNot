import { isSupportedPage } from '@/lib/extraction/is-supported-page';
import type { ExtractionResult, SourceMode } from '@/types/source';

const MENU_ADD_PAGE = 'add-page';
const MENU_ADD_SELECTION = 'add-selection';
const WARNING_DURATION_MS = 3000;

const EXTRACTOR_FILES: Record<SourceMode, '/extract-page.js' | '/extract-selection.js'> = {
  page: '/extract-page.js',
  selection: '/extract-selection.js',
};

export default defineBackground(() => {
  createMenus();
  browser.contextMenus.onClicked.addListener(handleMenuClick);
});

function createMenus() {
  browser.contextMenus.removeAll(() => {
    browser.contextMenus.create({
      id: MENU_ADD_PAGE,
      title: 'Sayfayı rapora ekle',
      contexts: ['page', 'selection'],
    });
    browser.contextMenus.create({
      id: MENU_ADD_SELECTION,
      title: 'Seçimi rapora ekle',
      contexts: ['selection'],
    });
  });
}

async function handleMenuClick(info: Browser.contextMenus.OnClickData, tab?: Browser.tabs.Tab) {
  if (!tab?.id || !isSupportedPage(tab.url)) {
    showWarning();
    return;
  }

  const mode: SourceMode = info.menuItemId === MENU_ADD_SELECTION ? 'selection' : 'page';
  const result = await extract(tab.id, mode);

  if (!result?.ok) {
    showWarning();
    return;
  }

  console.log('DipNot: kaynak çıkarıldı', result.source);
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

function showWarning() {
  browser.action.setBadgeBackgroundColor({ color: '#d93025' });
  browser.action.setBadgeText({ text: '!' });
  setTimeout(() => browser.action.setBadgeText({ text: '' }), WARNING_DURATION_MS);
}

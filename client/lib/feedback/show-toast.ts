import type { FeedbackKind } from '@/types/feedback';

// Bu fonksiyon sekmeye serileştirilerek enjekte edilir; dışarıdan hiçbir değişken ya da içe aktarma kullanamaz.
export function showToast(text: string, kind: FeedbackKind): void {
  const hostId = 'dipnot-toast-host';
  const colors = { success: '#188038', info: '#1a73e8', warning: '#d93025' };

  document.getElementById(hostId)?.remove();

  const host = document.createElement('div');
  host.id = hostId;
  host.style.cssText = 'all:initial;position:fixed;top:16px;right:16px;z-index:2147483647;pointer-events:none;';

  const box = document.createElement('div');
  box.setAttribute('role', 'status');
  box.textContent = text;
  box.style.cssText =
    'box-sizing:border-box;max-width:340px;padding:12px 16px;border-radius:8px;' +
    'background:#202124;color:#fff;font:14px/1.4 system-ui,sans-serif;' +
    'box-shadow:0 4px 12px rgba(0,0,0,.3);border-left:4px solid ' +
    colors[kind];

  host.attachShadow({ mode: 'closed' }).append(box);
  document.documentElement.append(host);
  setTimeout(() => host.remove(), 4000);
}

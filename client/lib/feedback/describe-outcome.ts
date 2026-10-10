import { MAX_SOURCES } from '@/lib/storage/add-to-collection';
import type { AddOutcome } from '@/lib/storage/collection-store';
import type { Feedback } from '@/types/feedback';
import type { SourceMode } from '@/types/source';

export const UNSUPPORTED_FEEDBACK: Feedback = {
  kind: 'warning',
  text: 'Bu sayfa desteklenmiyor (tarayıcı sayfası, Web Mağazası ya da PDF).',
};

export const EMPTY_FEEDBACK: Feedback = {
  kind: 'warning',
  text: 'Bu sayfadan metin alınamadı. Metni seçip "Seçimi rapora ekle" deneyin.',
};

export const SAVE_ERROR_FEEDBACK: Feedback = {
  kind: 'warning',
  text: 'Kaynak kaydedilemedi. Lütfen tekrar deneyin.',
};

export const FAILED_FEEDBACK: Feedback = {
  kind: 'warning',
  text: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.',
};

export function describeOutcome(outcome: AddOutcome, mode: SourceMode): Feedback {
  const { status, count, source } = outcome;
  const truncatedNote = source?.truncated ? ' (uzun olduğu için kısaltıldı)' : '';

  switch (status) {
    case 'added':
      return {
        kind: 'success',
        text: `${mode === 'page' ? 'Sayfa' : 'Seçim'} rapora eklendi (${count}/${MAX_SOURCES})${truncatedNote}.`,
      };
    case 'updated':
      return {
        kind: 'success',
        text:
          mode === 'page'
            ? `Kaynak güncellendi, tüm sayfa alındı${truncatedNote}.`
            : `Seçim kaynağa eklendi, kaynakta ${source?.passages.length ?? 0} pasaj var${truncatedNote}.`,
      };
    case 'unchanged':
      if (mode === 'selection' && source?.mode === 'page') {
        return { kind: 'info', text: 'Bu sayfa zaten tam olarak ekli, seçim ayrıca eklenmedi.' };
      }
      if (mode === 'selection' && source?.truncated) {
        return { kind: 'warning', text: 'Kaynak uzunluk sınırına ulaştı, bu seçim sığmadı.' };
      }
      return { kind: 'info', text: 'Bu içerik zaten ekli, bir değişiklik yapılmadı.' };
    case 'full':
      return {
        kind: 'warning',
        text: `Kaynak sınırı doldu (${count}/${MAX_SOURCES}). Yeni sayfa eklemek için bir kaynağı çıkarın. Eklediğiniz bir sayfayı güncelleyebilirsiniz.`,
      };
  }
}

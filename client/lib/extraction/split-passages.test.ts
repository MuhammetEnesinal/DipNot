import { describe, expect, it } from 'vitest';
import { splitPassages } from './split-passages';

const LONG = 'Bu paragraf yeterince uzun olduğu için tek başına bir pasaj oluşturur ve birleştirilmez.';

describe('splitPassages', () => {
  it('uzun paragraflara sıralı kimlik verir', () => {
    const result = splitPassages([LONG, `${LONG} İkinci.`]);

    expect(result.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('kısa paragrafı sonrakiyle birleştirir', () => {
    const result = splitPassages(['Başlık', LONG]);

    expect(result).toEqual([{ id: 'p1', text: `Başlık ${LONG}` }]);
  });

  it('sondaki kısa paragrafı öncekine ekler', () => {
    const result = splitPassages([LONG, 'Son söz']);

    expect(result).toEqual([{ id: 'p1', text: `${LONG} Son söz` }]);
  });

  it('yalnızca kısa paragraf varsa tek pasaj üretir', () => {
    expect(splitPassages(['Kısa'])).toEqual([{ id: 'p1', text: 'Kısa' }]);
  });

  it('boşlukları normalleştirir ve boş paragrafları atar', () => {
    const result = splitPassages(['  ', `${LONG}\n\n  devam   eder `]);

    expect(result).toEqual([{ id: 'p1', text: `${LONG} devam eder` }]);
  });

  it('boş girdi için boş liste döner', () => {
    expect(splitPassages([])).toEqual([]);
  });
});

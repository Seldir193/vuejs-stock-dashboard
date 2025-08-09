// src/tests/metrics.test.js
import { describe, it, expect } from 'vitest';
import { computeYoYLast4 } from '../utils/metrics';

describe('computeYoYLast4', () => {
  it('returns null values if less than 8 entries', () => {
    expect(computeYoYLast4([100, 200, 300])).toEqual([null, null, null, null]);
  });

  it('calculates correct YoY % for last 4 quarters', () => {
    const data = [100, 200, 300, 400, 110, 210, 310, 410];
    const result = computeYoYLast4(data);
    expect(result).toEqual([
      ((110 - 100) / 100) * 100,
      ((210 - 200) / 200) * 100,
      ((310 - 300) / 300) * 100,
      ((410 - 400) / 400) * 100
    ]);
  });
});

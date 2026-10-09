import test from 'node:test';
import assert from 'node:assert/strict';

test('a returned named national road replaces the generic pending label', async () => {
  const { roadPresentation } = await import('../src/lib/roadPresentation.ts').catch(() => ({}));
  const result = roadPresentation?.({ category: 'unknown' }, { distance: 12300, steps: [{ road: 'G317国道', distance: 12300 }] });
  assert.equal(result?.category, '国道');
  assert.equal(result?.road, 'G317国道');
  assert.equal(result?.distance, '12.3 km');
});

test('unnamed roads keep their grade unverified', async () => {
  const { roadPresentation } = await import('../src/lib/roadPresentation.ts').catch(() => ({}));
  const result = roadPresentation?.({ category: 'unknown' }, { distance: 1200, steps: [{ road: '', distance: 1200 }] });
  assert.equal(result?.category, '道路等级待核实');
});

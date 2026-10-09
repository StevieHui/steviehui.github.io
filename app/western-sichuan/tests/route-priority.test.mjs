import test from 'node:test';
import assert from 'node:assert/strict';

const routes = [
  { id: 'd1', day: 1, mode: 'driving' },
  { id: 'd2', day: 2, mode: 'driving' },
  { id: 'd3-a', day: 3, mode: 'driving' },
  { id: 'd3-b', day: 3, mode: 'driving' },
];

test('the selected day moves ahead of earlier unstarted days', async () => {
  const { pickNextRoute } = await import('../src/map/routePriority.ts').catch(() => ({}));
  assert.equal(pickNextRoute?.(routes, 3, { d1: 1 }, new Set()), routes[2]);
});

test('a failed selected-day segment is retried before other days', async () => {
  const { pickNextRoute } = await import('../src/map/routePriority.ts').catch(() => ({}));
  assert.equal(pickNextRoute?.(routes, 3, { d1: 1, 'd3-a': 1, 'd3-b': 1 }, new Set()), routes[2]);
});

test('the overview still schedules the first unstarted segment', async () => {
  const { pickNextRoute } = await import('../src/map/routePriority.ts').catch(() => ({}));
  assert.equal(pickNextRoute?.(routes, null, {}, new Set()), routes[0]);
});

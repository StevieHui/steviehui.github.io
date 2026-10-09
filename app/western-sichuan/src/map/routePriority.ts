export interface RouteCandidate { id: string; day: number; mode: string }

export function pickNextRoute<T extends RouteCandidate>(
  routes: readonly T[],
  selectedDay: number | null,
  attempts: Readonly<Record<string, number>>,
  completed: ReadonlySet<string>,
): T | undefined {
  const eligible = routes.filter(route => route.mode === 'driving' && !completed.has(route.id) && (attempts[route.id] ?? 0) < 2);
  if (selectedDay !== null) {
    const selected = eligible.filter(route => route.day === selectedDay);
    const first = selected.find(route => !attempts[route.id]);
    if (first) return first;
    const retry = selected.find(route => attempts[route.id] === 1);
    if (retry) return retry;
  }
  return eligible.find(route => !attempts[route.id]) ?? eligible.find(route => attempts[route.id] === 1);
}

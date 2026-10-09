import { categoryLabels, classifyRoad } from '../data/roadSegments.ts';
import type { RoadCategory } from '../data/itinerary.ts';

interface RoadStep { road: string; distance: number }
interface RoadResult { distance: number | null; steps: RoadStep[] }

export function roadPresentation(segment: { category: RoadCategory }, route?: RoadResult) {
  if (!route) return { road: '待规划', category: categoryLabels[segment.category], distance: '待核实' };
  const roads = [...new Set(route.steps.map(step => step.road.trim()).filter(Boolean))];
  const categories = segment.category === 'mountain'
    ? ['mountain' as RoadCategory]
    : [...new Set(route.steps.map(step => classifyRoad(step.road)).filter(category => category !== 'unknown'))];
  const category = categories.length === 0 ? categoryLabels.unknown
    : categories.length === 1 ? categoryLabels[categories[0]]
      : `混合道路（${categories.map(item => categoryLabels[item]).join(' / ')}）`;
  const distance = route.distance != null && Number.isFinite(route.distance)
    ? `${(route.distance / 1000).toFixed(1)} km` : '待核实';
  return { road: roads.slice(0, 3).join('、') || '道路名称待核实', category, distance };
}

import type { Coordinates } from '../data/itinerary';

declare global {
  interface Window {
    AMap?: any;
    _AMapSecurityConfig?: { securityJsCode: string };
    __westernSichuanAmapReady?: () => void;
  }
}

let pending: Promise<any> | undefined;

export function loadAmap(): Promise<any> {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (pending) return pending;
  const key = import.meta.env.VITE_AMAP_KEY?.trim();
  const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE?.trim();
  if (!key || !securityCode) return Promise.reject(new Error('高德地图尚未配置 JS API Key 与安全密钥'));
  window._AMapSecurityConfig = { securityJsCode: securityCode };
  pending = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('高德地图加载超时，请稍后重试')), 15000);
    window.__westernSichuanAmapReady = () => {
      window.clearTimeout(timeout);
      if (window.AMap) resolve(window.AMap);
      else reject(new Error('高德地图对象不可用'));
    };
    const script = document.createElement('script');
    script.async = true;
    script.onerror = () => { window.clearTimeout(timeout); pending = undefined; reject(new Error('高德地图脚本加载失败')); };
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}&plugin=AMap.Driving,AMap.ToolBar&callback=__westernSichuanAmapReady`;
    document.head.appendChild(script);
  });
  return pending;
}

export interface RouteStep { road: string; distance: number; path: Coordinates[]; toll: boolean | null }
export interface PlannedRoute { steps: RouteStep[]; distance: number | null; duration: number | null; tolls: number | null }
const cache = new Map<string, Promise<PlannedRoute>>();

export function planDriving(AMap: any, id: string, from: Coordinates, to: Coordinates): Promise<PlannedRoute> {
  const stored = cache.get(id);
  if (stored) return stored;
  const result = new Promise<PlannedRoute>((resolve, reject) => {
    const driving = new AMap.Driving({ policy: AMap.DrivingPolicy?.LEAST_TIME ?? 0, hideMarkers: true, autoFitView: false });
    const timer = window.setTimeout(() => reject(new Error('规划超时')), 16000);
    driving.search(from, to, (status: string, data: any) => {
      window.clearTimeout(timer);
      const route = data?.routes?.[0];
      if (status !== 'complete' || !route?.steps?.length) { reject(new Error(`道路规划未返回有效路线：${String(data?.info || status)}`)); return; }
      const steps: RouteStep[] = route.steps.map((step: any) => ({
        road: String(step.road || ''), distance: Number(step.distance || 0),
        path: Array.isArray(step.path) ? step.path.map((p: any) => [Number(p.lng), Number(p.lat)] as Coordinates).filter((p: Coordinates) => Number.isFinite(p[0]) && Number.isFinite(p[1])) : [],
        toll: null,
      })).filter((step: RouteStep) => step.path.length > 1);
      if (!steps.length) { reject(new Error('道路规划缺少可绘制轨迹')); return; }
      resolve({ steps, distance: Number.isFinite(Number(route.distance)) ? Number(route.distance) : null, duration: Number.isFinite(Number(route.time)) ? Number(route.time) : null, tolls: Number.isFinite(Number(route.tolls)) ? Number(route.tolls) : null });
    });
  });
  cache.set(id, result);
  result.catch(() => cache.delete(id));
  return result;
}

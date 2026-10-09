import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { days, points, type Waypoint } from '../data/itinerary';
import { classifyRoad, segments, type RouteSegment } from '../data/roadSegments';
import { loadAmap, planDriving, type PlannedRoute, type RouteStep } from './amap';
import { pickNextRoute } from './routePriority';

type Line = { day: number; object: any };
type Marker = { day: number; object: any; point: Waypoint };
interface Props {
  selectedDay: number | null;
  satellite: boolean;
  showLabels: boolean;
  overviewToken: number;
  onSegmentClick: (segment: RouteSegment, step?: RouteStep, route?: PlannedRoute) => void;
  onWaypointClick: (point: Waypoint) => void;
  onRouteStatus: (id: string, status: string) => void;
  onRouteData: (id: string, route: PlannedRoute) => void;
}

export function RouteMap({ selectedDay, satellite, showLabels, overviewToken, onSegmentClick, onWaypointClick, onRouteStatus, onRouteData }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const layer = useRef<any>(null);
  const kind = useRef<'amap' | 'leaflet' | null>(null);
  const lines = useRef<Line[]>([]);
  const markers = useRef<Marker[]>([]);
  const selection = useRef(selectedDay);
  const labels = useRef(showLabels);
  const clickSegment = useRef(onSegmentClick);
  const clickPoint = useRef(onWaypointClick);
  const routeStatus = useRef(onRouteStatus);
  const routeData = useRef(onRouteData);
  const [error, setError] = useState('');
  selection.current = selectedDay;
  labels.current = showLabels;
  clickSegment.current = onSegmentClick;
  clickPoint.current = onWaypointClick;
  routeStatus.current = onRouteStatus;
  routeData.current = onRouteData;

  const refresh = () => {
    if (!map.current) return;
    if (kind.current === 'amap') {
      for (const item of markers.current) {
        const visible = selection.current === null || item.day === selection.current;
        item.object.setMap(visible ? map.current : null);
        item.object.setLabel(visible && labels.current ? { direction: 'top', content: `<span class="map-label">${item.point.name}</span>`, offset: new window.AMap.Pixel(0, -8) } : null);
      }
      for (const item of lines.current) item.object.setOptions({ strokeOpacity: selection.current === null || selection.current === item.day ? .88 : .15, strokeWeight: selection.current === item.day ? 7 : 4 });
      const fitted = [...markers.current.filter(x => selection.current === null || x.day === selection.current).map(x => x.object), ...lines.current.filter(x => selection.current === null || x.day === selection.current).map(x => x.object)];
      if (fitted.length) map.current.setFitView(fitted, false, [72, 72, 72, 72], 16);
    } else {
      for (const item of markers.current) {
        const visible = selection.current === null || item.day === selection.current;
        if (visible) item.object.addTo(map.current);
        else item.object.remove();
        if (visible && labels.current) item.object.bindTooltip(item.point.name, { direction: 'top', offset: [0, -12] });
        else item.object.unbindTooltip();
      }
      const selected = markers.current.filter(x => selection.current === null || x.day === selection.current);
      if (selected.length) map.current.fitBounds(L.latLngBounds(selected.map(x => [x.point.coordinates[1], x.point.coordinates[0]] as [number,number])), { padding: [48,48], maxZoom: 11 });
    }
  };

  useEffect(() => {
    let cancelled = false;
    let leafletMap: L.Map | undefined;
    async function initialize() {
      try {
        const AMap = await loadAmap();
        if (cancelled || !container.current) return;
        kind.current = 'amap';
        const instance = new AMap.Map(container.current, { zoom: 8, center: [103.5, 31.9], mapStyle: 'amap://styles/normal', viewMode: '2D' });
        map.current = instance;
        for (const day of days) {
          for (const point of day.waypoints) {
            const marker = new AMap.Marker({ position: point.coordinates, offset: new AMap.Pixel(-9,-9), content: `<span class="map-pin" style="--pin:${day.color}"></span>`, title: point.name });
            marker.on('click', () => clickPoint.current(point));
            marker.setMap(instance);
            markers.current.push({ day: day.number, object: marker, point });
          }
        }
        refresh();
        const drivingSegments = segments.filter(x => x.mode === 'driving');
        const attempts: Record<string, number> = {};
        const completed = new Set<string>();
        let nextRequestAt = 0;
        while (!cancelled) {
          const waitMs = Math.max(0, nextRequestAt - Date.now());
          if (waitMs) await new Promise(resolve => window.setTimeout(resolve, waitMs));
          if (cancelled) break;
          const segment = pickNextRoute(drivingSegments, selection.current, attempts, completed);
          if (!segment) break;
          attempts[segment.id] = (attempts[segment.id] ?? 0) + 1;
          routeStatus.current(segment.id, attempts[segment.id] === 1 ? '高德路线规划中' : '高德路线重试中');
          nextRequestAt = Date.now() + 2200;
          try {
            const route = await planDriving(AMap, segment.id, points[segment.from].coordinates, points[segment.to].coordinates);
            if (cancelled) break;
            const matched = !segment.verifyRoad || route.steps.some(step => step.road.includes(segment.verifyRoad!) || /(?:国道\s*)?G?622(?:国道)?/i.test(step.road));
            if (!matched) { completed.add(segment.id); routeStatus.current(segment.id, '未验证经过理小路，未绘制导航线'); continue; }
            completed.add(segment.id);
            routeStatus.current(segment.id, '已取得高德道路轨迹');
            routeData.current(segment.id, route);
            for (const step of route.steps) {
              const category = segment.category === 'mountain' ? 'mountain' : classifyRoad(step.road);
              const color = category === 'mountain' ? '#c67943' : days[segment.day - 1].color;
              const polyline = new AMap.Polyline({ path: step.path, strokeColor: color, strokeWeight: 4, strokeOpacity: .88, strokeStyle: category === 'unknown' ? 'dashed' : 'solid', lineJoin: 'round', zIndex: segment.day === 3 ? 55 : 40 });
              polyline.on('click', () => clickSegment.current(segment, step, route));
              polyline.setMap(instance);
              lines.current.push({ day: segment.day, object: polyline });
            }
          } catch (cause) {
            const reason = cause instanceof Error ? cause.message.slice(0, 70) : '未知原因';
            const limited = reason.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT');
            if (limited) nextRequestAt = Date.now() + 5000;
            routeStatus.current(segment.id, attempts[segment.id] < 2
              ? limited ? '高德请求限流，稍后重试' : `首次失败，准备重试：${reason}`
              : limited ? '高德请求限流，请稍后刷新重试' : `高德未返回有效路线：${reason}`);
          }
          refresh();
        }
      } catch (cause) {
        if (cancelled || !container.current) return;
        setError(cause instanceof Error ? cause.message : '高德地图暂不可用');
        kind.current = 'leaflet';
        leafletMap = L.map(container.current, { zoomControl: false }).setView([31.8, 103.5], 8);
        map.current = leafletMap;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 18 }).addTo(leafletMap);
        L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);
        for (const day of days) for (const point of day.waypoints) {
          const marker = L.marker([point.coordinates[1], point.coordinates[0]], { icon: L.divIcon({ className: 'leaflet-pin-wrap', html: `<span class="map-pin" style="--pin:${day.color}"></span>`, iconSize: [18,18] }) });
          marker.on('click', () => clickPoint.current(point));
          markers.current.push({ day: day.number, object: marker, point });
        }
        refresh();
      }
    }
    initialize();
    return () => {
      cancelled = true;
      if (kind.current === 'amap') map.current?.destroy();
      leafletMap?.remove();
      map.current = null; markers.current = []; lines.current = []; kind.current = null;
    };
  }, []);

  useEffect(() => { refresh(); }, [selectedDay, showLabels, overviewToken]);
  useEffect(() => {
    if (kind.current !== 'amap' || !map.current) return;
    if (satellite) {
      layer.current ??= new window.AMap.TileLayer.Satellite();
      map.current.setLayers([layer.current]);
    } else map.current.setLayers([new window.AMap.TileLayer()]);
  }, [satellite]);

  return <div className="map-shell"><div ref={container} className="map-canvas" role="application" aria-label="川西六日行程交互地图" />{error && <div className="map-alert"><strong>高德地图暂不可用</strong><span>{error}。当前显示可交互的景点定位图；道路轨迹和路段数据待高德配置后加载。</span></div>}</div>;
}

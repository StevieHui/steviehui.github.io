import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CalendarDays, ChevronDown, ChevronUp, Clock3, ExternalLink, Layers3, LocateFixed, MapPinned, Moon, Navigation2, Route, TrainFront, TriangleAlert } from 'lucide-react';
import { days, points, type Waypoint } from './data/itinerary';
import { categoryLabels, classifyRoad, segments, type RouteSegment } from './data/roadSegments';
import { RouteMap } from './map/RouteMap';
import type { PlannedRoute, RouteStep } from './map/amap';
import { assessFlight, localDate } from './lib/planning';
import { roadPresentation } from './lib/roadPresentation';

function useStored(key: string, initial: string): [string, (value: string) => void] {
  const [value, setValue] = useState(() => { try { return localStorage.getItem(key) ?? initial; } catch { return initial; } });
  const update = (next: string) => { setValue(next); try { localStorage.setItem(key, next); } catch { /* private mode */ } };
  return [value, update];
}

type Selection = { kind:'point'; point:Waypoint } | { kind:'segment'; segment:RouteSegment; step?:RouteStep; route?:PlannedRoute } | null;
function navUrl(from: Waypoint, to: Waypoint) {
  const url = new URL('https://uri.amap.com/navigation');
  url.searchParams.set('from', `${from.coordinates.join(',')},${from.name}`);
  url.searchParams.set('to', `${to.coordinates.join(',')},${to.name}`);
  url.searchParams.set('mode', 'car');
  url.searchParams.set('src', 'western-sichuan-roadbook');
  return url.toString();
}

export function App() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayOne, setDayOne] = useStored('ws-day-one', '');
  const [flight, setFlight] = useStored('ws-flight', '22:00');
  const [trainArrival, setTrainArrival] = useStored('ws-train-arrival', '');
  const [satellite, setSatellite] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [overviewToken, setOverviewToken] = useState(0);
  const [selection, setSelection] = useState<Selection>(null);
  const [statuses, setStatuses] = useState<Record<string,string>>({});
  const [routeData, setRouteData] = useState<Record<string,PlannedRoute>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const day = selectedDay ? days[selectedDay - 1] : null;
  const activeSegments = selectedDay ? segments.filter(x => x.day === selectedDay) : [];
  const drivingSegments = activeSegments.filter(x => x.mode === 'driving');
  const plannedSegments = drivingSegments.filter(x => routeData[x.id]);
  const pendingSegments = drivingSegments.filter(x => !routeData[x.id] && !statuses[x.id]?.startsWith('高德未返回') && !statuses[x.id]?.startsWith('未验证'));
  const plannedDistance = plannedSegments.reduce((sum, x) => sum + (routeData[x.id].distance ?? 0), 0);
  const plannedMinutes = plannedSegments.reduce((sum, x) => sum + (routeData[x.id].duration ?? 0), 0) / 60;
  const roadBreakdown = { expressway: 0, ordinary: 0, mountain: 0, unknown: 0 };
  for (const segment of plannedSegments) for (const step of routeData[segment.id].steps) {
    const category = segment.category === 'mountain' ? 'mountain' : classifyRoad(step.road);
    if (category === 'expressway') roadBreakdown.expressway += step.distance;
    else if (category === 'mountain') roadBreakdown.mountain += step.distance;
    else if (category === 'unknown') roadBreakdown.unknown += step.distance;
    else roadBreakdown.ordinary += step.distance;
  }
  const flightRisk = assessFlight(trainArrival, flight);
  const selectedRoad = selection?.kind === 'segment' ? roadPresentation(selection.segment, selection.route) : null;

  useEffect(() => { setSelection(null); }, [selectedDay]);
  const chooseDay = (number: number) => { setSelectedDay(number); setSheetOpen(true); };
  const touchStart = useRef(0);
  const dayChange = (direction: number) => chooseDay(Math.max(1, Math.min(6, (selectedDay ?? 1) + direction)));

  return <div className="app">
    <aside className={`sidebar ${sheetOpen ? 'sheet-open' : ''}`} onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 70) dayChange(delta < 0 ? 1 : -1); }}>
      <header className="brand"><div className="eyebrow"><span className="brand-mark">✳</span> FIELD NOTES / 001</div><h1>川西<span> · </span>雪山与海子</h1><p>Western Sichuan Roadbook</p></header>
      <button className="mobile-handle" onClick={() => setSheetOpen(!sheetOpen)} aria-label={sheetOpen ? '收起行程' : '展开行程'}>{sheetOpen ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}<span>行程详情</span></button>
      <div className="sidebar-scroll">
        <div className="trip-meta"><span><Route size={15}/> 六日行程</span><span><MapPinned size={15}/> 川西 · 九寨沟</span></div>
        <label className="date-input"><span><CalendarDays size={16}/> 设置出发日期</span><input type="date" value={dayOne} onChange={event => setDayOne(event.target.value)} aria-label="Day 1 出发日期" /></label>
        <div className="section-head"><span>路线章节</span><button onClick={() => { setSelectedDay(null); setSelection(null); setSheetOpen(false); setOverviewToken(x=>x+1); }}>查看全部 <ArrowRight size={14}/></button></div>
        <div className="day-list">{days.map(item => <button key={item.number} className={`day-item ${selectedDay === item.number ? 'active' : ''}`} onClick={() => chooseDay(item.number)} style={{ '--day-color': item.color } as CSSProperties}>
          <span className="day-number">{String(item.number).padStart(2,'0')}</span><span className="day-copy"><strong>{item.title}</strong><small>{item.route}</small></span><span className="day-date">{dayOne ? localDate(dayOne, item.number - 1) : `DAY ${item.number}`}</span>
        </button>)}</div>
        <AnimatePresence mode="wait"><motion.div key={day?.number ?? 'overview'} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.18 }}>
          {day ? <div className="day-detail"><div className="detail-kicker" style={{color:day.color}}>DAY {String(day.number).padStart(2,'0')} / THE ROUTE</div><h2>{day.title}</h2><p className="detail-route">{day.route}</p>
            <div className="stats"><div><span>交通方式</span><strong>{day.modes.join(' · ')}</strong></div><div><span>住宿</span><strong>{day.stay}</strong></div><div><span>已规划公路 / 车程</span><strong>{plannedSegments.length ? `${(plannedDistance/1000).toFixed(1)} km · ${Math.round(plannedMinutes)} 分钟${plannedSegments.length < drivingSegments.length ? '（部分）' : ''}` : '待核实'}</strong></div></div>
            {day.number === 3 && <div className="risk-card"><div className="risk-heading"><TriangleAlert size={17}/> 理小路通行提示</div><p>{day.tip}</p><p>国道 622 理小路为山区道路。落石、积雪和结冰为潜在季节性风险，当前状态请查询官方公告。</p><a href="https://www.abazhou.gov.cn/" target="_blank" rel="noreferrer">阿坝州人民政府公告入口 <ExternalLink size={13}/></a></div>}
            {day.number === 6 && <div className="flight-card"><div className="flight-title"><Clock3 size={17}/> 返程时间评估</div><p className="airport-warning">建议最晚 19:30 左右抵达天府机场</p><div className="flight-inputs"><label>高铁到达成都东站<input type="time" value={trainArrival} onChange={e => setTrainArrival(e.target.value)} /></label><label>航班起飞<input type="time" value={flight} onChange={e => setFlight(e.target.value)} /></label></div><div className={`flight-result ${flightRisk === '不建议选择' ? 'danger' : ''}`}>{flightRisk}</div><small>按站至机场 90 分钟、机场提前 150 分钟估算；仅供规划，不是实时交通预测。实际车次与耗时须另行核对。</small></div>}
            <div className="section-head section-gap"><span>当日时间轴</span></div><div className="timeline">{day.schedule.map((item,i) => <div className="timeline-item" key={i}><span>{item.time}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</div>
            <div className="tip"><Moon size={16}/><span>{day.tip}</span></div>
            <div className="section-head section-gap"><span>路段明细</span><small>{activeSegments.length} 段</small></div>
            <div className="segment-list">{activeSegments.map(segment => {
              const detail = roadPresentation(segment, routeData[segment.id]);
              return <button key={segment.id} className="segment-row" onClick={() => setSelection({kind:'segment',segment,route:routeData[segment.id]})}>
                <span className={`route-glyph ${routeData[segment.id] ? classifyRoad(routeData[segment.id].steps.find(step => step.road)?.road || '') : segment.category}`}></span>
                <span><strong>{segment.label}</strong><small>{segment.mode === 'driving' ? `${detail.category} · ${detail.road} · ${detail.distance}` : `${categoryLabels[segment.category]} · 站点关系示意`}</small><small>{statuses[segment.id] || (segment.mode === 'driving' ? '排队等待高德规划' : '线路几何待核实')}</small></span>
                <ArrowRight size={14}/>
              </button>;
            })}</div>
            {plannedSegments.length > 0 && <div className="road-totals"><span>已规划高速 <strong>{(roadBreakdown.expressway/1000).toFixed(1)} km</strong></span><span>已识别国省县乡道路 <strong>{(roadBreakdown.ordinary/1000).toFixed(1)} km</strong></span><span>已规划山区道路 <strong>{(roadBreakdown.mountain/1000).toFixed(1)} km</strong></span><span>等级待核实 <strong>{(roadBreakdown.unknown/1000).toFixed(1)} km</strong></span></div>}
            <p className="data-note">上述仅统计成功取得高德规划结果的公路段；未返回结果的道路、铁路与景区内部里程仍待核实。道路等级根据返回的道路名称识别。</p>
          </div> : <div className="overview-copy"><span className="detail-kicker">THE JOURNEY</span><h2>从平原驶入雪山，<br/>再走向海子。</h2><p>六天，串联都江堰、四姑娘山、理小路、九寨沟与黄龙。点击一天，地图会聚焦当日停靠点与已验证的道路轨迹。</p><div className="overview-metrics"><span>06 <small>天</small></span><span>02 <small>高山景区</small></span><span>01 <small>重点山路</small></span></div><div className="overview-note"><TriangleAlert size={17}/><span>铁路和景区内线路只标注站点关系；没有可靠几何数据时不绘制模拟轨迹。</span></div></div>}
        </motion.div></AnimatePresence>
      </div>
      <footer className="sidebar-footer"><span>ROUTEBOOK · 2026</span><span>出行前复核道路与车次</span></footer>
    </aside>

    <main className="map-area"><RouteMap selectedDay={selectedDay} satellite={satellite} showLabels={showLabels} overviewToken={overviewToken} onSegmentClick={(segment,step,route)=>setSelection({kind:'segment',segment,step,route})} onWaypointClick={point=>setSelection({kind:'point',point})} onRouteStatus={(id,status)=>setStatuses(current=>({...current,[id]:status}))} onRouteData={(id,route)=>setRouteData(current=>({...current,[id]:route}))}/>
      <div className="map-top"><div className="map-title"><span className="live-dot"></span><span>{day ? `DAY ${day.number} · ${day.title}` : '川西全线总览'}</span><small>{day ? day.route : '六日交互式地图'}</small></div><div className="map-actions"><button onClick={() => {setSelectedDay(null);setOverviewToken(x=>x+1)}} title="路线总览"><LocateFixed size={18}/><span>总览</span></button><button onClick={() => setSatellite(x=>!x)} title="切换标准 / 卫星地图"><Layers3 size={18}/><span>{satellite ? '标准' : '卫星'}</span></button><button onClick={() => setShowLabels(x=>!x)} title="显示或隐藏景点标签"><MapPinned size={18}/><span>标签</span></button><button onClick={() => setShowLegend(x=>!x)} title="道路类型图例"><Route size={18}/><span>图例</span></button></div></div>
      {day && drivingSegments.length > 0 && <div className="route-progress" role="status">DAY {day.number} 道路轨迹 {plannedSegments.length}/{drivingSegments.length}{pendingSegments.length > 0 ? ' · 正在规划' : plannedSegments.length < drivingSegments.length ? ' · 部分路段未取得高德轨迹' : ' · 已完成'}</div>}
      {showLegend && <div className="legend"><strong>地图图例</strong><div><i className="legend-line solid"/> 高速 / 国省道：实线*</div><div><i className="legend-line mountain"/> 理小路：橙色实线*</div><div><i className="legend-line unknown"/> 未核实等级：虚线</div><div><i className="legend-dot"/> 景点 / 车站</div><small>*只绘制高德返回并完成路段验证的几何；铁路与景区内部未核实轨迹不绘线。</small></div>}
      <div className="map-bottom"><button onClick={() => {setSelectedDay(null);setOverviewToken(x=>x+1);setSheetOpen(false)}} className={selectedDay === null ? 'current' : ''}>全线</button>{days.map(item => <button key={item.number} onClick={() => chooseDay(item.number)} className={selectedDay === item.number ? 'current' : ''}><span style={{background:item.color}}/>D{item.number}</button>)}</div>
      <AnimatePresence>{selection && <motion.div className="info-card" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:15}}><button className="close-info" onClick={()=>setSelection(null)} aria-label="关闭详情">×</button>{selection.kind === 'point' ? <><span className="info-kicker">WAYPOINT / 景点</span><h3>{selection.point.name}</h3><p>{selection.point.note}</p><a href={`https://uri.amap.com/marker?position=${selection.point.coordinates.join(',')}&name=${encodeURIComponent(selection.point.name)}&src=western-sichuan-roadbook`} target="_blank" rel="noreferrer">在高德地图查看 <ExternalLink size={14}/></a></> : <><span className="info-kicker">ROUTE SEGMENT / 路段</span><h3>{selection.segment.label}</h3><div className="info-grid"><span>起点</span><strong>{points[selection.segment.from].name}</strong><span>终点</span><strong>{points[selection.segment.to].name}</strong><span>道路名称</span><strong>{selection.step?.road || selectedRoad?.road || '待核实'}</strong><span>道路等级</span><strong>{selection.step ? categoryLabels[selection.segment.category === 'mountain' ? 'mountain' : classifyRoad(selection.step.road)] : selectedRoad?.category || categoryLabels[selection.segment.category]}</strong><span>路段距离</span><strong>{selection.step?.distance || selection.route?.distance ? `${((selection.step?.distance || selection.route?.distance || 0)/1000).toFixed(1)} km` : '待核实'}</strong><span>预计驾驶时间</span><strong>{selection.route?.duration ? `${Math.round(selection.route.duration/60)} 分钟（整段）` : '待核实'}</strong><span>收费信息</span><strong>{selection.route?.tolls != null ? `${selection.route.tolls} 元（整段估算）` : '待核实'}</strong><span>驾驶难度</span><strong>{selection.segment.category === 'mountain' ? '较高（山区）' : '待核实'}</strong></div><p>{selection.segment.note}</p>{selection.segment.risks && <div className="risk-tags">{selection.segment.risks.map(x=><span key={x}>{x}</span>)}</div>}{selection.segment.alternative && <p>备选：{selection.segment.alternative}</p>}{selection.segment.mode === 'driving' && <a href={navUrl(points[selection.segment.from],points[selection.segment.to])} target="_blank" rel="noreferrer">打开高德导航 <Navigation2 size={14}/></a>}</>}</motion.div>}</AnimatePresence>
    </main>
  </div>;
}

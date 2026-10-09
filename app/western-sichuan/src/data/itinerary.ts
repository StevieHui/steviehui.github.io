export type Coordinates = [number, number];
export type TransportMode = '自驾' | '高铁' | '汽车' | '景区观光车' | '步行' | '机场交通';
export type RoadCategory = 'expressway' | 'national' | 'provincial' | 'local' | 'mountain' | 'railway' | 'walking' | 'shuttle' | 'unknown';
export type RoadRisk = '高海拔' | '急弯' | '季节性冰雪' | '可能临时管制' | '落石风险';
export interface Waypoint { id: string; name: string; coordinates: Coordinates; note: string; duration?: string }
export interface TravelSchedule { time: string; title: string; detail: string }
export interface Day { number: number; title: string; route: string; modes: TransportMode[]; stay: string; color: string; waypoints: Waypoint[]; schedule: TravelSchedule[]; tip: string }

export const points: Record<string, Waypoint> = {
  chengdu: { id: 'chengdu', name: '成都', coordinates: [104.0665, 30.5723], note: '出发与返程枢纽' },
  dujiangyan: { id: 'dujiangyan', name: '都江堰景区', coordinates: [103.608, 31.000], note: '世界文化遗产，建议预留半天' },
  nanqiao: { id: 'nanqiao', name: '南桥', coordinates: [103.614, 30.998], note: '晚间看蓝眼泪灯光' },
  guanxian: { id: 'guanxian', name: '灌县古城', coordinates: [103.615, 30.996], note: '古城散步与晚餐' },
  yingxiu: { id: 'yingxiu', name: '映秀', coordinates: [103.493, 31.062], note: '沿途节点' },
  wolong: { id: 'wolong', name: '卧龙', coordinates: [103.150, 31.035], note: '山区交通节点' },
  balang: { id: 'balang', name: '巴朗山附近', coordinates: [102.879, 30.910], note: '高海拔，留意天气和道路公告' },
  shuangqiao: { id: 'shuangqiao', name: '双桥沟', coordinates: [102.777, 30.999], note: '乘景区观光车游览' },
  siguniang: { id: 'siguniang', name: '四姑娘山镇', coordinates: [102.847, 30.999], note: '第二晚住宿' },
  lixiao: { id: 'lixiao', name: '理小路沿线', coordinates: [102.96, 31.39], note: '仅作行程节点；准确道路轨迹待核实' },
  bipenggou: { id: 'bipenggou', name: '毕棚沟', coordinates: [102.991, 31.233], note: '景区游览，留意关门时间' },
  li: { id: 'li', name: '理县', coordinates: [103.165, 31.436], note: '返程沿线节点' },
  wenchuan: { id: 'wenchuan', name: '汶川', coordinates: [103.590, 31.476], note: '返程沿线节点' },
  sanxingdui: { id: 'sanxingdui', name: '三星堆博物馆', coordinates: [104.206, 31.009], note: '参观需提前预约' },
  sanxingduiStation: { id: 'sanxingduiStation', name: '三星堆站', coordinates: [104.207, 31.067], note: '车站位置及车次请以 12306 为准' },
  huanglongStation: { id: 'huanglongStation', name: '黄龙九寨站', coordinates: [103.540, 32.707], note: '预留接驳时间' },
  jiuzhai: { id: 'jiuzhai', name: '九寨沟口', coordinates: [103.918, 33.261], note: '景区入口与住宿区' },
  rize: { id: 'rize', name: '日则沟', coordinates: [103.895, 33.169], note: '景区观光车游览' },
  wuhua: { id: 'wuhua', name: '五花海', coordinates: [103.889, 33.149], note: '经典海子' },
  pearl: { id: 'pearl', name: '珍珠滩瀑布', coordinates: [103.895, 33.175], note: '栈道步行' },
  zechawa: { id: 'zechawa', name: '则查洼沟', coordinates: [103.846, 33.114], note: '景区观光车游览' },
  changhai: { id: 'changhai', name: '长海', coordinates: [103.834, 33.113], note: '高海拔景点' },
  shuzheng: { id: 'shuzheng', name: '树正沟', coordinates: [103.907, 33.223], note: '沟内景观与栈道' },
  huanglong: { id: 'huanglong', name: '黄龙景区', coordinates: [103.826, 32.755], note: '上午游览，关注高海拔反应' },
  chengduEast: { id: 'chengduEast', name: '成都东站', coordinates: [104.141, 30.628], note: '返程铁路到达站' },
  tianfu: { id: 'tianfu', name: '天府国际机场', coordinates: [104.443, 30.312], note: '建议最晚 19:30 左右抵达' },
};

const w = (...ids: string[]) => ids.map(id => points[id]);
export const days: Day[] = [
  { number: 1, title: '水润都江堰', route: '成都 → 都江堰', modes: ['自驾'], stay: '都江堰', color: '#416d68', waypoints: w('chengdu','dujiangyan','nanqiao','guanxian'), schedule: [
    { time: '上午', title: '成都取车', detail: '检查车辆与山路行驶装备后出发。' },
    { time: '下午', title: '都江堰景区', detail: '步行游览，时长按预约和体力调整。' },
    { time: '晚上', title: '南桥与灌县古城', detail: '散步、晚餐，住都江堰。' }], tip: '景区门票和开放时间出发前再确认。' },
  { number: 2, title: '驶向四姑娘山', route: '都江堰 → 四姑娘山', modes: ['自驾','景区观光车'], stay: '四姑娘山镇', color: '#7391a5', waypoints: w('dujiangyan','yingxiu','wolong','balang','shuangqiao','siguniang'), schedule: [
    { time: '06:30', title: '从都江堰出发', detail: '经映秀、卧龙、巴朗山附近前往双桥沟。' },
    { time: '白天', title: '双桥沟', detail: '按景区观光车运行情况游览。' },
    { time: '晚上', title: '入住四姑娘山镇', detail: '注意海拔变化，安排休息。' }], tip: '山区天气与交通管制可能变化，预留弹性时间。' },
  { number: 3, title: '理小路的山峦', route: '四姑娘山 → 理小路 → 毕棚沟 → 成都', modes: ['自驾'], stay: '成都', color: '#bd8154', waypoints: w('siguniang','lixiao','bipenggou','li','wenchuan','chengdu'), schedule: [
    { time: '06:00', title: '从四姑娘山镇出发', detail: '理小路通行状态须在出发前核实。' },
    { time: '中午—下午', title: '毕棚沟游览', detail: '具体时长受交通及景区开放时间影响。' },
    { time: '晚上', title: '返回成都还车', detail: '长距离山路驾驶，建议安排替换驾驶员。' }], tip: '理小路属于高海拔山区道路，存在季节性交通管制风险。出发前请查询阿坝州交通运输部门最新公告。' },
  { number: 4, title: '穿越古蜀与群山', route: '成都 → 三星堆 → 黄龙九寨站 → 九寨沟', modes: ['汽车','高铁','汽车'], stay: '九寨沟口', color: '#8d78a7', waypoints: w('chengdu','sanxingdui','sanxingduiStation','huanglongStation','jiuzhai'), schedule: [
    { time: '上午', title: '三星堆博物馆', detail: '提前预约并核对参观时段。' },
    { time: '下午', title: '前往三星堆站', detail: '车次待确定出发日期后以 12306 为准。' },
    { time: '傍晚—晚上', title: '高铁与接驳', detail: '抵达黄龙九寨站后乘接驳车到九寨沟口。' }], tip: '铁路只展示站点关系；未获取可靠轨迹前不绘制铁路线路。' },
  { number: 5, title: '把一天留给九寨', route: '九寨沟景区环线', modes: ['景区观光车','步行'], stay: '九寨沟口', color: '#5e9c8f', waypoints: w('jiuzhai','rize','wuhua','pearl','zechawa','changhai','shuzheng'), schedule: [
    { time: '全天', title: '三条沟分段游览', detail: '按当日景区调度选择观光车与开放栈道。' },
    { time: '重点', title: '五花海 · 珍珠滩 · 长海', detail: '景区内部线路会调整，现场标识优先。' }], tip: '景区内部不使用普通驾车导航；地图标记景点，实际乘车和步行按现场指引。' },
  { number: 6, title: '黄龙与归途', route: '九寨沟 → 黄龙 → 成都 → 天府机场', modes: ['汽车','高铁','机场交通'], stay: '返程', color: '#8b9270', waypoints: w('jiuzhai','huanglong','huanglongStation','chengduEast','tianfu'), schedule: [
    { time: '06:30', title: '从九寨沟口出发', detail: '前往黄龙景区，注意早间路况。' },
    { time: '上午', title: '黄龙景区', detail: '游览时长受排队、海拔及天气影响。' },
    { time: '下午', title: '高铁返回成都东站', detail: '车次待定，订票前核对接驳余量。' },
    { time: '建议 19:30 前', title: '抵达天府机场', detail: '约 22:00 起飞；建议最晚 19:30 左右到达机场。' }], tip: '返程最紧凑的一天。建议最晚 19:30 左右抵达天府机场。' },
];

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
  bipenggou: { id: 'bipenggou', name: '毕棚沟景区入口', coordinates: [102.994424, 31.380620], note: '高德景区 POI 位置；游览请从实际开放入口进入' },
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
    { time: '09:00–10:00', title: '成都取车与早餐', detail: '检查证件、油量、轮胎和山路用品；不必天亮前出发。' },
    { time: '10:00–12:00', title: '前往都江堰', detail: '按当天导航行驶；遇拥堵则顺延午餐和入园。' },
    { time: '12:00–13:30', title: '午餐与停车', detail: '把车停在景区周边正规停车场，步行前往入口。' },
    { time: '13:30–17:00', title: '都江堰景区', detail: '按预约时段游览，给步行和拍照留出时间。' },
    { time: '18:00–20:00', title: '南桥与灌县古城', detail: '晚餐、散步，之后在都江堰休息。' }], tip: '这些是建议时间段；门票、入园时段和当天路况出发前再确认。' },
  { number: 2, title: '驶向四姑娘山', route: '都江堰 → 四姑娘山', modes: ['自驾','景区观光车'], stay: '四姑娘山镇', color: '#7391a5', waypoints: w('dujiangyan','yingxiu','wolong','balang','shuangqiao','siguniang'), schedule: [
    { time: '07:30–08:00', title: '早餐与出发', detail: '经映秀、卧龙、巴朗山附近前往双桥沟；这天需要在下午停止入园前到达。' },
    { time: '08:00–12:00', title: '山区行车', detail: '预计用半天，实际到达时间以导航、天气和交通管制为准；途中短暂停靠。' },
    { time: '12:00–13:00', title: '午餐与入园准备', detail: '若接近景区最晚入园时间，先入园并调整午餐。' },
    { time: '13:00–17:00', title: '双桥沟', detail: '乘观光车分段游览；晚到时缩减停留点，按当天末班车安排返回。' },
    { time: '17:30–19:00', title: '四姑娘山镇入住', detail: '晚餐后休息，留意高海拔反应。' }], tip: '双桥沟现行旺季公告为 08:00–15:00 入园。建议 07:30 左右出发；山区道路慢行时应提前出发或缩短游览。' },
  { number: 3, title: '理小路的山峦', route: '四姑娘山 → 理小路 → 毕棚沟 → 成都', modes: ['自驾'], stay: '成都', color: '#bd8154', waypoints: w('siguniang','lixiao','bipenggou','li','wenchuan','chengdu'), schedule: [
    { time: '06:30–07:00', title: '早餐与通行核对', detail: '这是长距离山路日；出发前确认理小路当日放行、天气及车况。' },
    { time: '07:00–11:30', title: '理小路山区行车', detail: '仅为行程时间预留，不代表道路已开放；遇管制不要强行通行。' },
    { time: '11:30–12:30', title: '午餐与到达毕棚沟', detail: '若实际到达明显晚于计划，优先调整或取消景区游览。' },
    { time: '12:30–15:30', title: '毕棚沟弹性游览', detail: '按当天入园和观光车时间安排，不能保证完整游览。' },
    { time: '15:30–20:30', title: '经由理县、汶川返回成都', detail: '行车时间仅作预留；山路夜间驾驶需谨慎，必要时在沿途住宿。' },
    { time: '20:30 后', title: '还车与休息', detail: '还车点营业时间提前核对，最好安排替换驾驶员。' }], tip: '这天非常紧凑。理小路可能临时管制；出发前查阿坝州公告，并备好绕行、跳过毕棚沟或沿途住宿方案。' },
  { number: 4, title: '穿越古蜀与群山', route: '成都 → 三星堆 → 黄龙九寨站 → 九寨沟', modes: ['汽车','高铁','汽车'], stay: '九寨沟口', color: '#8d78a7', waypoints: w('chengdu','sanxingdui','sanxingduiStation','huanglongStation','jiuzhai'), schedule: [
    { time: '09:00–10:00', title: '成都早餐与出发', detail: '这天不必早起；根据预约时段前往三星堆。' },
    { time: '10:00–13:00', title: '三星堆博物馆', detail: '提前预约；实际入馆时间和参观时长以门票为准。' },
    { time: '13:00–14:00', title: '午餐', detail: '不要把午餐、行李领取和进站时间挤在一起。' },
    { time: '14:00–车次前', title: '前往三星堆站', detail: '按购票车次倒推，建议预留至少 45 分钟进站；车次以 12306 为准。' },
    { time: '抵站后', title: '黄龙九寨站接驳', detail: '核对当日接驳末班时间，前往九寨沟口入住。' }], tip: '先锁定三星堆预约和高铁车次，再按真实发车时间调整时间轴。铁路未获取可靠轨迹时只展示站点关系。' },
  { number: 5, title: '把一天留给九寨', route: '九寨沟景区环线', modes: ['景区观光车','步行'], stay: '九寨沟口', color: '#5e9c8f', waypoints: w('jiuzhai','rize','wuhua','pearl','zechawa','changhai','shuzheng'), schedule: [
    { time: '07:30–08:30', title: '早餐与入园', detail: '按预约时段入园；想走满三条沟，建议在开放后不久开始。' },
    { time: '08:30–12:00', title: '日则沟', detail: '乘观光车到开放站点，分段游览五花海、珍珠滩等。' },
    { time: '12:00–13:00', title: '午餐与换乘', detail: '在允许区域用餐，按现场调度安排下一段。' },
    { time: '13:00–15:00', title: '则查洼沟', detail: '前往长海等开放景点，注意高海拔与步行体力。' },
    { time: '15:00–17:30', title: '树正沟与出园', detail: '沿开放栈道慢行，留出返回入口的观光车时间。' },
    { time: '18:00 后', title: '九寨沟口晚餐', detail: '回酒店休息，为次日较早出发做准备。' }], tip: '九寨沟现行旺季公告为 08:00–14:00 入园、18:00 闭园；游览顺序随当天观光车调度调整。' },
  { number: 6, title: '黄龙与归途', route: '九寨沟 → 黄龙 → 成都 → 天府机场', modes: ['汽车','高铁','机场交通'], stay: '返程', color: '#8b9270', waypoints: w('jiuzhai','huanglong','huanglongStation','chengduEast','tianfu'), schedule: [
    { time: '06:30–07:00', title: '早餐与离开九寨沟口', detail: '这天需要赶黄龙、车站和约 22:00 的航班，建议较早出发。' },
    { time: '07:00–09:30', title: '前往黄龙', detail: '山区行车仅作时间预留，遇拥堵或天气变化及时压缩景区停留。' },
    { time: '09:30–12:30', title: '黄龙景区', detail: '按实际开放情况和体力游览；高海拔不要赶路。' },
    { time: '12:30–车次前', title: '午餐并前往黄龙九寨站', detail: '按所购高铁倒推车站接驳与进站时间，不要临时估算。' },
    { time: '下午车次', title: '高铁至成都东站', detail: '具体发车与到达时刻须以 12306 为准；优先选择能留足机场余量的车次。' },
    { time: '19:30 前', title: '抵达天府机场', detail: '以约 22:00 起飞计算；从成都东站到机场的时间另行核对。' }], tip: '返程最紧凑的一天。若购不到能在 19:30 前到机场的车次，应缩短或取消黄龙游览，不要赌接驳时间。' },
];

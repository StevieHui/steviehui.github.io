import type { RoadCategory, RoadRisk } from './itinerary';

export interface RouteSegment {
  id: string;
  day: number;
  from: string;
  to: string;
  mode: 'driving' | 'railway' | 'walking' | 'shuttle';
  label: string;
  category: RoadCategory;
  risks?: RoadRisk[];
  note: string;
  alternative?: string;
  verifyRoad?: string;
}

export const segments: RouteSegment[] = [
  { id:'d1-road', day:1, from:'chengdu', to:'dujiangyan', mode:'driving', label:'成都 → 都江堰', category:'unknown', note:'道路名称、等级与收费以高德规划结果为准。' },
  { id:'d2-a', day:2, from:'dujiangyan', to:'yingxiu', mode:'driving', label:'都江堰 → 映秀', category:'unknown', note:'山区出行，关注天气与管制公告。' },
  { id:'d2-b', day:2, from:'yingxiu', to:'wolong', mode:'driving', label:'映秀 → 卧龙', category:'unknown', note:'路线规划结果以高德实际返回为准。' },
  { id:'d2-c', day:2, from:'wolong', to:'balang', mode:'driving', label:'卧龙 → 巴朗山附近', category:'unknown', risks:['高海拔','季节性冰雪'], note:'山路弯多，风险为季节性道路特征，并非实时路况。' },
  { id:'d2-d', day:2, from:'balang', to:'shuangqiao', mode:'driving', label:'巴朗山附近 → 双桥沟', category:'unknown', note:'出发前核对通行条件。' },
  { id:'d2-e', day:2, from:'shuangqiao', to:'siguniang', mode:'driving', label:'双桥沟 → 四姑娘山镇', category:'unknown', note:'以高德返回道路为准。' },
  { id:'d3-lixiao', day:3, from:'siguniang', to:'bipenggou', mode:'driving', label:'理小路重点路段', category:'mountain', risks:['高海拔','急弯','季节性冰雪','可能临时管制','落石风险'], note:'理小路准确轨迹与实时通行状态待核实，地图不绘制未经验证的导航线。', alternative:'如封路，考虑绕行汶川、理县方向；具体路径与耗时须当日查询。', verifyRoad:'理小路' },
  { id:'d3-return-a', day:3, from:'bipenggou', to:'li', mode:'driving', label:'毕棚沟 → 理县', category:'unknown', note:'道路等级以高德规划步骤为准。' },
  { id:'d3-return-b', day:3, from:'li', to:'wenchuan', mode:'driving', label:'理县 → 汶川', category:'unknown', note:'道路等级以高德规划步骤为准。' },
  { id:'d3-return-c', day:3, from:'wenchuan', to:'chengdu', mode:'driving', label:'汶川 → 成都', category:'unknown', note:'道路等级以高德规划步骤为准。' },
  { id:'d4-car', day:4, from:'chengdu', to:'sanxingdui', mode:'driving', label:'成都 → 三星堆博物馆', category:'unknown', note:'接驳方案待实际车次确认。' },
  { id:'d4-rail', day:4, from:'sanxingduiStation', to:'huanglongStation', mode:'railway', label:'三星堆站 → 黄龙九寨站', category:'railway', note:'高铁关系示意；未绘制铁路几何。车次与时间待 12306 核实。' },
  { id:'d4-shuttle', day:4, from:'huanglongStation', to:'jiuzhai', mode:'shuttle', label:'黄龙九寨站 → 九寨沟口', category:'shuttle', note:'接驳车班次与道路路线待核实。' },
  { id:'d5-shuttle', day:5, from:'jiuzhai', to:'rize', mode:'shuttle', label:'九寨沟观光车', category:'shuttle', note:'景区调度线路以现场为准。' },
  { id:'d5-walk', day:5, from:'wuhua', to:'pearl', mode:'walking', label:'海子与瀑布栈道', category:'walking', note:'开放栈道以景区现场公告为准。' },
  { id:'d6-car-a', day:6, from:'jiuzhai', to:'huanglong', mode:'driving', label:'九寨沟口 → 黄龙景区', category:'unknown', note:'晨间山区道路，留足天气余量。' },
  { id:'d6-car-b', day:6, from:'huanglong', to:'huanglongStation', mode:'driving', label:'黄龙景区 → 黄龙九寨站', category:'unknown', note:'需匹配实际高铁发车时间。' },
  { id:'d6-rail', day:6, from:'huanglongStation', to:'chengduEast', mode:'railway', label:'黄龙九寨站 → 成都东站', category:'railway', note:'仅显示站点关系；车次待确认日期后查询。' },
  { id:'d6-airport', day:6, from:'chengduEast', to:'tianfu', mode:'shuttle', label:'成都东站 → 天府机场', category:'shuttle', note:'地铁或机场交通方案待确认，不绘制未核实线路。' },
];

export const categoryLabels: Record<RoadCategory,string> = {
  expressway:'高速公路', national:'国道', provincial:'省道', local:'普通道路', mountain:'山区道路', railway:'高铁', walking:'景区步行', shuttle:'观光车 / 接驳', unknown:'道路等级待核实',
};

export function classifyRoad(name: string): RoadCategory {
  if (/理小路/.test(name)) return 'mountain';
  if (/高速|高速公路|(^|\W)G(?:\d{1,2}|\d{4})($|\W)/i.test(name)) return 'expressway';
  if (/国道|^G\d{3}/i.test(name)) return 'national';
  if (/省道|^S\d{3}/i.test(name)) return 'provincial';
  if (/县道|乡道|^X\d{3}|^Y\d{3}/i.test(name)) return 'local';
  return 'unknown';
}

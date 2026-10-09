export function localDate(dayOne: string, offset: number): string {
  if (!dayOne) return '';
  const [year, month, day] = dayOne.split('-').map(Number);
  const date = new Date(year, month - 1, day + offset);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export type FlightRisk = '时间充裕' | '时间紧张' | '不建议选择' | '待填写高铁到站时间';
export function assessFlight(trainArrival: string, flightDeparture: string, transferMinutes = 90, bufferMinutes = 150): FlightRisk {
  if (!trainArrival || !flightDeparture) return '待填写高铁到站时间';
  const toMinutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m; };
  const margin = toMinutes(flightDeparture) - toMinutes(trainArrival) - transferMinutes - bufferMinutes;
  if (margin >= 90) return '时间充裕';
  if (margin >= 0) return '时间紧张';
  return '不建议选择';
}

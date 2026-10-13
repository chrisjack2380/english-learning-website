export type StageView = {
  name: string;
  atlas: 'life' | 'process';
  tile: number;
  focus: string;
  motion: 'walk' | 'arrive' | 'work' | 'talk';
  state: string;
};
const view = (
  name: string,
  atlas: StageView['atlas'],
  tile: number,
  focus: string,
  motion: StageView['motion'],
  state: string,
): StageView => ({ name, atlas, tile, focus, motion, state });
/** Authored views, independent of lesson and progress IDs. New views never invalidate old completions. */
export const stageViews: Record<string, StageView[]> = {
  'leave-home': [
    view('家 · 准备出门', 'life', 0, 'center', 'work', 'Get ready'),
    view('街道 · 步行进站', 'process', 0, 'center', 'walk', 'Leave home'),
  ],
  station: [
    view('地铁站 · 入口与售票机', 'life', 1, 'left', 'walk', 'Buy a ticket'),
    view('站台 · 等待列车', 'process', 1, 'center', 'arrive', 'Wait behind the line'),
  ],
  train: [
    view('车厢 · 早高峰', 'life', 8, 'right', 'arrive', 'Next stop'),
    view('站台 · 换乘', 'process', 1, 'left', 'walk', 'Transfer here'),
  ],
  'office-arrival': [
    view('办公室 · 到达', 'life', 7, 'left', 'walk', 'Clock in'),
    view('会议区 · 查看安排', 'process', 7, 'center', 'work', 'Check the schedule'),
  ],
  'commute-chat': [
    view('办公室 · 与同事聊天', 'life', 7, 'right', 'talk', 'How was your commute?'),
  ],
  'shopping-list': [view('超市 · 入口', 'life', 2, 'left', 'walk', 'Check your list')],
  produce: [view('蔬果区 · 挑选食材', 'process', 8, 'center', 'work', 'Choose fresh produce')],
  labels: [view('货架 · 阅读包装', 'life', 2, 'right', 'work', 'Check the label')],
  substitute: [
    view('货架 · 寻找替代品', 'process', 8, 'right', 'talk', 'Ask about an alternative'),
  ],
  checkout: [view('收银台 · 付款', 'process', 2, 'center', 'work', 'Check the total')],
  table: [view('餐厅入口 · 找座位', 'life', 3, 'left', 'talk', 'A table for two')],
  menu: [view('餐桌 · 读菜单', 'process', 3, 'center', 'work', 'Look at the menu')],
  diet: [view('餐桌 · 说明饮食需求', 'process', 3, 'left', 'talk', 'Ask about ingredients')],
  'meal-problem': [view('餐桌 · 解决用餐问题', 'life', 3, 'right', 'talk', 'Explain the problem')],
  bill: [view('餐桌 · 核对账单', 'process', 3, 'right', 'work', 'Could we have the bill?')],
  'flight-check-in': [view('机场 · 值机', 'life', 4, 'left', 'talk', 'Show your booking')],
  security: [view('机场 · 安检前准备', 'life', 4, 'right', 'work', 'Follow the instructions')],
  gate: [view('候机区 · 查看登机口', 'process', 4, 'center', 'arrive', 'Check your gate')],
  boarding: [
    view('登机通道 · 准备登机', 'process', 4, 'right', 'walk', 'Have your boarding pass ready'),
  ],
  arrival: [view('到达大厅 · 找行李', 'life', 4, 'center', 'walk', 'Collect your baggage')],
  'hotel-arrival': [view('酒店前台 · 办理入住', 'process', 5, 'center', 'talk', 'Check in')],
  'hotel-room': [view('客房 · 熟悉环境', 'life', 5, 'left', 'work', 'Check the room')],
  'hotel-facilities': [
    view('酒店 · 询问设施', 'process', 5, 'left', 'talk', 'Ask about breakfast'),
  ],
  'room-issue': [view('客房 · 描述问题', 'life', 5, 'right', 'talk', 'Explain what is wrong')],
  'hotel-checkout': [view('酒店前台 · 退房', 'process', 5, 'right', 'work', 'Check your bill')],
  appointment: [view('诊所 · 预约登记', 'life', 6, 'left', 'talk', 'Confirm your appointment')],
  symptoms: [view('诊室 · 描述症状', 'process', 6, 'center', 'talk', 'Describe how you feel')],
  'medical-history': [
    view('诊室 · 说明健康记录', 'process', 6, 'left', 'talk', 'Share relevant information'),
  ],
  clarification: [
    view('诊室 · 确认理解', 'process', 6, 'right', 'talk', 'Could you explain that?'),
  ],
  'follow-up': [view('诊所 · 确认下一步', 'life', 6, 'right', 'work', 'Check the follow-up plan')],
  'office-plan': [view('办公桌 · 安排任务', 'life', 7, 'left', 'work', 'Plan your day')],
  'office-clarify': [view('办公区 · 确认要求', 'life', 7, 'right', 'talk', 'Clarify the task')],
  'office-meeting': [view('会议室 · 讨论计划', 'process', 7, 'center', 'talk', 'Share your view')],
  'office-update': [view('会议室 · 汇报进展', 'process', 7, 'left', 'work', 'Give an update')],
  'office-handoff': [
    view('办公区 · 交接工作', 'life', 7, 'center', 'talk', 'Confirm the next step'),
  ],
};

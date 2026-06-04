/**
 * Developmental milestones ("cột mốc") the baby unlocks across 0–24 months —
 * reframed as features the baby ships. Local-first checklist. Ranges are wide
 * on purpose: every baby has its own pace, so this never flags "late".
 */
export interface Milestone {
  id: string;
  minMonth: number;
  maxMonth: number;
  name: string;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  { id: 'smile', minMonth: 1, maxMonth: 3, name: 'Cười với bố mẹ', emoji: '😊' },
  { id: 'headup', minMonth: 1, maxMonth: 4, name: 'Ngẩng đầu khi nằm sấp', emoji: '🆙' },
  { id: 'coo', minMonth: 2, maxMonth: 4, name: 'Ê a, hóng chuyện', emoji: '🗣️' },
  { id: 'roll', minMonth: 3, maxMonth: 6, name: 'Biết lẫy / lật', emoji: '🔄' },
  { id: 'grab', minMonth: 3, maxMonth: 6, name: 'Với và cầm đồ', emoji: '✋' },
  { id: 'sit-support', minMonth: 5, maxMonth: 7, name: 'Ngồi khi có người đỡ', emoji: '🪑' },
  { id: 'babble', minMonth: 5, maxMonth: 9, name: 'Bập bẹ "ba ba, ma ma"', emoji: '👶' },
  { id: 'sit', minMonth: 6, maxMonth: 9, name: 'Ngồi vững một mình', emoji: '🧘' },
  { id: 'crawl', minMonth: 7, maxMonth: 10, name: 'Biết bò', emoji: '🐛' },
  { id: 'pincer', minMonth: 8, maxMonth: 11, name: 'Nhặt đồ bằng hai ngón', emoji: '🤏' },
  { id: 'pullup', minMonth: 9, maxMonth: 12, name: 'Vịn đứng dậy', emoji: '🧍' },
  { id: 'wave', minMonth: 9, maxMonth: 13, name: 'Vẫy tay bye-bye', emoji: '👋' },
  { id: 'cruise', minMonth: 10, maxMonth: 13, name: 'Đi men theo đồ', emoji: '🚶' },
  { id: 'firstword', minMonth: 10, maxMonth: 15, name: 'Gọi "ba / mẹ" có nghĩa', emoji: '💬' },
  { id: 'walk', minMonth: 11, maxMonth: 16, name: 'Tự bước đi', emoji: '🦶' },
  { id: 'selffeed', minMonth: 14, maxMonth: 22, name: 'Tự xúc ăn', emoji: '🥄' },
  { id: 'point', minMonth: 12, maxMonth: 18, name: 'Chỉ tay vào đồ muốn', emoji: '👆' },
  { id: 'words', minMonth: 15, maxMonth: 21, name: 'Nói được vài từ', emoji: '🔤' },
  { id: 'run', minMonth: 18, maxMonth: 24, name: 'Chạy lon ton', emoji: '🏃' },
  { id: 'twowords', minMonth: 18, maxMonth: 24, name: 'Ghép 2 từ ("mẹ bế")', emoji: '🗨️' },
];

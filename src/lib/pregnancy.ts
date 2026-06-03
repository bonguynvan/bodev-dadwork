export interface WeekInfo {
  week: number;
  /** approx length head-to-rump (≤20w) then head-to-heel, cm */
  lengthCm: number;
  /** approx weight, grams */
  weightG: number;
  trimester: 1 | 2 | 3;
  /** real fruit equivalent (credibility / SEO) */
  fruit: string;
  /** funny dev-object size comparison */
  compare: string;
  emoji: string;
  /** dev-flavoured milestone shipped this "build" */
  milestone: string;
}

export const TOTAL_WEEKS = 40;
export const MIN_WEEK = 4;
export const MAX_WEEK = 40;
export const DEFAULT_WEEK = 20;
const DAY = 86_400_000;

// Approximate averages — a fun tool, not medical advice.
export const WEEKS: WeekInfo[] = [
  { week: 4, lengthCm: 0.1, weightG: 0.4, trimester: 1, fruit: 'hạt anh túc', compare: 'một bit dữ liệu', emoji: '🫧', milestone: 'khởi tạo repo — `git init`, mới chỉ là một dấu chấm' },
  { week: 5, lengthCm: 0.2, weightG: 0.5, trimester: 1, fruit: 'hạt vừng', compare: 'con trỏ chuột', emoji: '🖱️', milestone: 'ống thần kinh dựng khung — scaffolding xong phần lõi' },
  { week: 6, lengthCm: 0.5, weightG: 0.8, trimester: 1, fruit: 'hạt đậu lăng', compare: 'một dấu chấm than `!`', emoji: '❗', milestone: 'tim thai bắt đầu đập — heartbeat service online 💓' },
  { week: 7, lengthCm: 1.0, weightG: 1, trimester: 1, fruit: 'quả việt quất', compare: 'một icon 16px', emoji: '🔲', milestone: 'mầm tay chân xuất hiện — limb modules được import' },
  { week: 8, lengthCm: 1.6, weightG: 1, trimester: 1, fruit: 'quả mâm xôi', compare: 'phím Esc', emoji: '⎋', milestone: 'ngón tay ngón chân khởi tạo — `array[10]` allocated' },
  { week: 9, lengthCm: 2.3, weightG: 2, trimester: 1, fruit: 'quả nho', compare: 'một con chip nhỏ', emoji: '🔌', milestone: 'cử động đầu tiên (chưa cảm nhận được) — first silent commit' },
  { week: 10, lengthCm: 3.1, weightG: 4, trimester: 1, fruit: 'quả quất', compare: 'đầu cắm USB-C', emoji: '🔌', milestone: 'các cơ quan đã có đủ — modules loaded, bắt đầu wiring' },
  { week: 11, lengthCm: 4.1, weightG: 7, trimester: 1, fruit: 'quả sung', compare: 'nút Enter cơ', emoji: '⏎', milestone: 'bắt đầu duỗi người, đạp nhẹ — `stretch()` chạy thử' },
  { week: 12, lengthCm: 5.4, weightG: 14, trimester: 1, fruit: 'quả chanh', compare: 'một con chip CPU', emoji: '🧠', milestone: 'phản xạ mút tay — reflex module loaded 👍' },
  { week: 13, lengthCm: 7.4, weightG: 23, trimester: 2, fruit: 'quả đậu Hà Lan', compare: 'một chiếc USB drive', emoji: '💾', milestone: 'vân tay được in — unique hash đã sinh ra' },
  { week: 14, lengthCm: 8.7, weightG: 43, trimester: 2, fruit: 'quả chanh vàng', compare: 'chuột Bluetooth mini', emoji: '🖱️', milestone: 'biết nhăn mặt, cau mày — UI states đầu tiên' },
  { week: 15, lengthCm: 10.1, weightG: 70, trimester: 2, fruit: 'quả táo', compare: 'một chiếc AirPods case', emoji: '🎧', milestone: 'cảm nhận ánh sáng — light sensor calibrating' },
  { week: 16, lengthCm: 11.6, weightG: 100, trimester: 2, fruit: 'quả bơ', compare: 'một con chuột không dây', emoji: '🖱️', milestone: 'bắt đầu nghe được âm thanh — audio input enabled 🎧' },
  { week: 17, lengthCm: 13, weightG: 140, trimester: 2, fruit: 'củ cải', compare: 'một chiếc remote TV', emoji: '📺', milestone: 'lớp mỡ nâu hình thành — caching layer warming up' },
  { week: 18, lengthCm: 14.2, weightG: 190, trimester: 2, fruit: 'quả ớt chuông', compare: 'một chiếc smartphone', emoji: '📱', milestone: 'cú đạp đủ mạnh để cảm nhận — `kick()` API public 🦵' },
  { week: 19, lengthCm: 15.3, weightG: 240, trimester: 2, fruit: 'quả cà chua', compare: 'một chiếc smartphone lớn', emoji: '📱', milestone: 'các giác quan online song song — senses chạy concurrent' },
  { week: 20, lengthCm: 25.6, weightG: 300, trimester: 2, fruit: 'quả chuối', compare: 'một chiếc bàn phím 60%', emoji: '⌨️', milestone: 'đi được nửa chặng đường — 50% build complete 🎉' },
  { week: 21, lengthCm: 26.7, weightG: 360, trimester: 2, fruit: 'củ cà rốt', compare: 'một chiếc Raspberry Pi', emoji: '🍓', milestone: 'biết nuốt, nấc cụt — swallowing pipeline hoạt động' },
  { week: 22, lengthCm: 27.8, weightG: 430, trimester: 2, fruit: 'quả đu đủ nhỏ', compare: 'một chiếc Nintendo Switch', emoji: '🎮', milestone: 'môi, mí mắt rõ nét — render details tăng độ phân giải' },
  { week: 23, lengthCm: 28.9, weightG: 501, trimester: 2, fruit: 'quả xoài', compare: 'một ổ cứng ngoài', emoji: '💽', milestone: 'nghe rõ giọng nói — bắt đầu nhận diện audio quen thuộc' },
  { week: 24, lengthCm: 30, weightG: 600, trimester: 2, fruit: 'bắp ngô', compare: 'một chiếc bàn phím cơ TKL', emoji: '⌨️', milestone: 'ngưỡng sống sót — survival threshold reached, nghe được tiếng gõ phím' },
  { week: 25, lengthCm: 34.6, weightG: 660, trimester: 2, fruit: 'củ cải đường', compare: 'một chiếc Steam Deck', emoji: '🎮', milestone: 'phản ứng với âm thanh — event listeners đã bind' },
  { week: 26, lengthCm: 35.6, weightG: 760, trimester: 2, fruit: 'hành lá (bó)', compare: 'một chiếc tablet 8 inch', emoji: '📱', milestone: 'mở mắt lần đầu — vision module booting 👁' },
  { week: 27, lengthCm: 36.6, weightG: 875, trimester: 2, fruit: 'súp lơ', compare: 'một chiếc router wifi', emoji: '📶', milestone: 'bắt đầu có nhịp thức/ngủ — scheduler đã chạy' },
  { week: 28, lengthCm: 37.6, weightG: 1005, trimester: 3, fruit: 'quả cà tím', compare: 'một chiếc laptop 13 inch', emoji: '💻', milestone: 'biết nằm mơ (REM) — background dreams enabled 💤' },
  { week: 29, lengthCm: 38.6, weightG: 1153, trimester: 3, fruit: 'quả bí đỏ nhỏ', compare: 'một chiếc bàn phím full-size', emoji: '⌨️', milestone: 'cơ và phổi tăng tốc — performance tuning giai đoạn cuối' },
  { week: 30, lengthCm: 39.9, weightG: 1319, trimester: 3, fruit: 'bắp cải nhỏ', compare: 'một chiếc iPad Pro 11"', emoji: '📲', milestone: 'điều hoà được thân nhiệt — thermostat tự quản lý' },
  { week: 31, lengthCm: 41.1, weightG: 1502, trimester: 3, fruit: 'quả dừa', compare: 'một case PC mini-ITX', emoji: '🖥️', milestone: 'tăng cân nhanh — bundle size tăng mỗi ngày 📦' },
  { week: 32, lengthCm: 42.4, weightG: 1702, trimester: 3, fruit: 'quả su hào', compare: 'một màn hình 15 inch', emoji: '🖥️', milestone: 'tập thở nhịp nhàng — respiratory dry-run' },
  { week: 33, lengthCm: 43.7, weightG: 1918, trimester: 3, fruit: 'quả dứa', compare: 'một chiếc MacBook Air', emoji: '💻', milestone: 'xương cứng dần (trừ hộp sọ) — freeze dependencies' },
  { week: 34, lengthCm: 45, weightG: 2146, trimester: 3, fruit: 'quả dưa lưới nhỏ', compare: 'một bàn phím cơ full + numpad', emoji: '⌨️', milestone: 'hệ thần kinh trung ương hoàn thiện — core API stable' },
  { week: 35, lengthCm: 46.2, weightG: 2383, trimester: 3, fruit: 'quả dưa vàng', compare: 'một chiếc MacBook Pro 14"', emoji: '💻', milestone: 'thận đã đủ chức năng — last services come online' },
  { week: 36, lengthCm: 47.4, weightG: 2622, trimester: 3, fruit: 'rau xà lách romaine', compare: 'một case PC mid-tower nhỏ', emoji: '🖥️', milestone: 'xoay đầu xuống — preparing for deploy 🔻' },
  { week: 37, lengthCm: 48.6, weightG: 2859, trimester: 3, fruit: 'cọng cần tây', compare: 'một màn hình 17 inch', emoji: '🖥️', milestone: 'đủ tháng sớm (early term) — release candidate sẵn sàng' },
  { week: 38, lengthCm: 49.8, weightG: 3083, trimester: 3, fruit: 'quả bí ngòi', compare: 'một chiếc MacBook Pro 16"', emoji: '💻', milestone: 'nắm tay đã chắc — grip() trả về giá trị mạnh 💪' },
  { week: 39, lengthCm: 50.7, weightG: 3288, trimester: 3, fruit: 'quả dưa hấu nhỏ', compare: 'một case PC mid-tower', emoji: '🖥️', milestone: 'đủ tháng (full term) — ready to ship 🚀' },
  { week: 40, lengthCm: 51.2, weightG: 3462, trimester: 3, fruit: 'quả bí ngô', compare: 'một dàn PC gaming hoàn chỉnh', emoji: '🎂', milestone: 'v1.0.0 — release day! deploy to production 🎉' },
];

const BY_WEEK = new Map(WEEKS.map((w) => [w.week, w]));

export function clampWeek(week: number): number {
  if (Number.isNaN(week)) return DEFAULT_WEEK;
  return Math.max(MIN_WEEK, Math.min(MAX_WEEK, Math.round(week)));
}

export function getWeek(week: number): WeekInfo {
  return BY_WEEK.get(clampWeek(week)) ?? BY_WEEK.get(DEFAULT_WEEK)!;
}

export const progress = (week: number): number => clampWeek(week) / TOTAL_WEEKS;

export const weeksRemaining = (week: number): number => Math.max(0, TOTAL_WEEKS - clampWeek(week));

export function trimesterLabel(t: 1 | 2 | 3): string {
  return t === 1 ? 'tam cá nguyệt 1' : t === 2 ? 'tam cá nguyệt 2' : 'tam cá nguyệt 3';
}

/** Estimated due date (epoch ms) if `week` is reached `from` now. */
export function dueDateFromWeek(week: number, from: number): number {
  return from + weeksRemaining(week) * 7 * DAY;
}

/** Infer current gestational week from a chosen due date. */
export function weekFromDueDate(dueMs: number, from: number): number {
  const weeksLeft = (dueMs - from) / (7 * DAY);
  return clampWeek(Math.round(TOTAL_WEEKS - weeksLeft));
}

/** "v1.0.0" build framing helpers. */
export const buildPercent = (week: number): number => Math.round(progress(week) * 100);

// ---- mood per week (drives the cartoon baby's expression) ----
export type Mood =
  | 'sweet'
  | 'excited'
  | 'proud'
  | 'determined'
  | 'silly'
  | 'sleepy'
  | 'wow'
  | 'grumpy'
  | 'curious'
  | 'celebrate';

const MOODS: Record<number, Mood> = {
  4: 'curious', // git init, just a dot
  5: 'determined', // scaffolding the core
  6: 'sweet', // heartbeat online 💓
  7: 'excited', // limb modules imported
  8: 'proud', // counting fingers + toes
  9: 'silly', // first sneaky silent move
  10: 'determined', // wiring all the organs
  11: 'sleepy', // first stretch / yawn
  12: 'sweet', // thumb-suck reflex 👍
  13: 'proud', // unique fingerprint hash
  14: 'grumpy', // literally learns to frown
  15: 'wow', // senses light
  16: 'sweet', // starts hearing 🎧
  17: 'sleepy', // cozy brown fat
  18: 'excited', // kick() goes public 🦵
  19: 'wow', // senses online in parallel
  20: 'celebrate', // 50% build complete 🎉
  21: 'silly', // hiccups
  22: 'sweet', // features sharpen up
  23: 'sweet', // recognizes your voice
  24: 'determined', // survival threshold reached
  25: 'excited', // reacts to sound
  26: 'wow', // opens eyes 👁
  27: 'sleepy', // sleep/wake scheduler
  28: 'sleepy', // dreaming (REM) 💤
  29: 'determined', // perf tuning
  30: 'proud', // self-regulates temperature
  31: 'silly', // bundle size go brrr 📦
  32: 'sleepy', // calm breathing dry-run
  33: 'determined', // bones harden
  34: 'proud', // core API stable
  35: 'proud', // last services online
  36: 'determined', // head down, prep deploy 🔻
  37: 'excited', // release candidate
  38: 'determined', // strong grip 💪
  39: 'excited', // ready to ship 🚀
  40: 'celebrate', // v1.0.0 release day 🎉
};

export const weekMood = (week: number): Mood => MOODS[clampWeek(week)] ?? 'silly';

// ---- dad "issues": fun tasks for the father each week ----
export type DadLabel = 'chuẩn bị' | 'sức khoẻ' | 'gắn kết' | 'mua sắm' | 'tài chính' | 'học';
export interface DadTask {
  t: string;
  l: DadLabel;
}

const DAD_TASKS: Record<number, DadTask[]> = {
  4: [
    { t: 'Đặt lịch khám thai lần đầu', l: 'chuẩn bị' },
    { t: 'Nhắc vợ uống axit folic mỗi ngày', l: 'sức khoẻ' },
  ],
  5: [
    { t: "Lập 'baby fund' — quỹ riêng cho bé", l: 'tài chính' },
    { t: 'Tìm hiểu bảo hiểm thai sản', l: 'học' },
  ],
  6: [
    { t: 'Nghe tim thai cùng vợ ở buổi khám 💓', l: 'gắn kết' },
    { t: 'Trữ sẵn bánh quy/gừng cho cơn nghén', l: 'sức khoẻ' },
  ],
  7: [
    { t: 'Nấu/đặt món vợ thèm, né mùi gây nghén', l: 'gắn kết' },
    { t: 'Đọc 1 chương sách thai kỳ', l: 'học' },
  ],
  8: [
    { t: 'Đi siêu âm cùng vợ, xin tấm ảnh đầu tiên', l: 'chuẩn bị' },
    { t: 'Gánh bớt việc nhà nặng cho vợ', l: 'gắn kết' },
  ],
  9: [
    { t: 'Nhập lịch khám cả thai kỳ vào calendar', l: 'chuẩn bị' },
    { t: 'Chọn bệnh viện/phòng khám sẽ sinh', l: 'học' },
  ],
  10: [
    { t: 'Hỏi bác sĩ về xét nghiệm sàng lọc', l: 'sức khoẻ' },
    { t: 'Mở danh sách đồ sơ sinh (chưa mua vội)', l: 'mua sắm' },
  ],
  11: [
    { t: 'Massage chân/lưng cho vợ buổi tối', l: 'gắn kết' },
    { t: 'Nhắc nhau uống đủ nước', l: 'sức khoẻ' },
  ],
  12: [
    { t: 'Báo tin gia đình (hết tam cá nguyệt 1)', l: 'chuẩn bị' },
    { t: 'Chụp ảnh bụng bầu mốc 12 tuần', l: 'gắn kết' },
  ],
  13: [
    { t: 'Lên ngân sách cho 6 tháng đầu', l: 'tài chính' },
    { t: 'Tìm hiểu chế độ nghỉ thai sản', l: 'học' },
  ],
  14: [
    { t: 'Bắt đầu trò chuyện với bụng mỗi tối', l: 'gắn kết' },
    { t: 'Dọn một góc phòng làm khu của bé', l: 'chuẩn bị' },
  ],
  15: [
    { t: 'Mở nhạc nhẹ cho bé nghe', l: 'gắn kết' },
    { t: 'Tìm lớp tiền sản cho hai vợ chồng', l: 'học' },
  ],
  16: [
    { t: 'Áp tai vào bụng — biết đâu nghe được 🎧', l: 'gắn kết' },
    { t: 'Khảo giá nôi, xe đẩy, ghế ô tô', l: 'mua sắm' },
  ],
  17: [
    { t: 'Chuẩn bị bữa giàu canxi & sắt cho vợ', l: 'sức khoẻ' },
    { t: 'Đặt mục tiêu tiết kiệm hàng tháng', l: 'tài chính' },
  ],
  18: [
    { t: 'Đặt tay lên bụng chờ cú đạp đầu 🦵', l: 'gắn kết' },
    { t: 'Hỏi giới tính (nếu hai vợ chồng muốn)', l: 'chuẩn bị' },
  ],
  19: [
    { t: 'Quay lại khoảnh khắc bé đạp', l: 'gắn kết' },
    { t: 'Lập shortlist tên cho bé', l: 'học' },
  ],
  20: [
    { t: '🎉 Nửa chặng — đưa vợ đi ăn mừng', l: 'gắn kết' },
    { t: 'Siêu âm hình thái, lưu lại ảnh', l: 'chuẩn bị' },
  ],
  21: [
    { t: 'Đọc truyện cho bé nghe trước khi ngủ', l: 'gắn kết' },
    { t: "Lên kế hoạch 'babymoon' nhẹ nhàng", l: 'chuẩn bị' },
  ],
  22: [
    { t: 'Chụp bộ ảnh bầu (nếu thích)', l: 'gắn kết' },
    { t: 'So sánh & chốt ghế ngồi ô tô', l: 'mua sắm' },
  ],
  23: [
    { t: 'Gọi tên bé khi nói chuyện với bụng', l: 'gắn kết' },
    { t: 'Tìm hiểu dấu hiệu sinh non cho yên tâm', l: 'học' },
  ],
  24: [
    { t: 'Học lắp ghế ô tô từ sớm 🔧', l: 'chuẩn bị' },
    { t: 'Cùng vợ làm test tiểu đường thai kỳ', l: 'sức khoẻ' },
  ],
  25: [
    { t: 'Trang trí phòng/khu vực của bé', l: 'chuẩn bị' },
    { t: 'Mua sắm đợt 1: đồ sơ sinh cơ bản', l: 'mua sắm' },
  ],
  26: [
    { t: 'Tập massage bầu giúp vợ dễ ngủ', l: 'gắn kết' },
    { t: 'Lập danh sách đồ mang đi sinh', l: 'chuẩn bị' },
  ],
  27: [
    { t: 'Chốt 2–3 tên cuối cùng', l: 'học' },
    { t: 'Tìm hiểu các cách giảm đau khi sinh', l: 'học' },
  ],
  28: [
    { t: 'Đếm cử động thai mỗi ngày cùng vợ', l: 'sức khoẻ' },
    { t: 'Dự phòng quỹ khẩn cấp cho ca sinh', l: 'tài chính' },
  ],
  29: [
    { t: 'Lắp nôi/cũi cho bé', l: 'chuẩn bị' },
    { t: 'Giặt & gấp quần áo sơ sinh', l: 'chuẩn bị' },
  ],
  30: [
    { t: 'Học pha sữa & tiệt trùng bình', l: 'học' },
    { t: 'Sạc sẵn pin máy ảnh/điện thoại', l: 'chuẩn bị' },
  ],
  31: [
    { t: 'Trữ đông vài món ăn cho mấy tuần đầu', l: 'chuẩn bị' },
    { t: "Cùng vợ viết 'birth plan'", l: 'học' },
  ],
  32: [
    { t: 'Chạy thử đường tới bệnh viện, canh giờ', l: 'chuẩn bị' },
    { t: 'Đổ đầy xăng, kiểm tra xe', l: 'chuẩn bị' },
  ],
  33: [
    { t: 'Đóng sẵn balo đi sinh (mẹ + bé + bố)', l: 'chuẩn bị' },
    { t: 'Lưu số bác sĩ/taxi vào máy', l: 'chuẩn bị' },
  ],
  34: [
    { t: 'Lắp & kiểm tra ghế ô tô lần cuối', l: 'sức khoẻ' },
    { t: 'Xem video cách bế & vỗ ợ hơi', l: 'học' },
  ],
  35: [
    { t: 'Sắp xếp nghỉ phép & bàn giao công việc', l: 'chuẩn bị' },
    { t: 'Nấu sẵn vài món, dọn nhà cửa', l: 'gắn kết' },
  ],
  36: [
    { t: 'Ôn dấu hiệu chuyển dạ thật/giả', l: 'học' },
    { t: 'Để balo đi sinh ngay cửa', l: 'chuẩn bị' },
  ],
  37: [
    { t: 'Đủ tháng sớm — sẵn sàng lên đường', l: 'chuẩn bị' },
    { t: 'Hẹn hò 2 người một lần nữa', l: 'gắn kết' },
  ],
  38: [
    { t: 'Báo người thân lịch hỗ trợ khi sinh', l: 'chuẩn bị' },
    { t: 'Ngủ đủ khi còn có thể 😴', l: 'sức khoẻ' },
  ],
  39: [
    { t: 'Bình tĩnh chờ — soát balo lần cuối', l: 'chuẩn bị' },
    { t: 'Cảm ơn vợ, nói lời yêu thương', l: 'gắn kết' },
  ],
  40: [
    { t: '🚀 Ship it! Bình tĩnh đưa vợ đi sinh', l: 'chuẩn bị' },
    { t: 'Bật camera, làm hậu phương vững vàng', l: 'gắn kết' },
  ],
};

export const dadTasks = (week: number): DadTask[] => DAD_TASKS[clampWeek(week)] ?? [];

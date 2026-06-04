import type { Mood, DadTask } from './pregnancy';
import { pickEvergreen } from './pregnancy';

export interface MonthInfo {
  month: number; // 0 = newborn
  lengthCm: number;
  weightG: number;
  compare: string;
  emoji: string;
  milestone: string;
  mood: Mood;
  dad: DadTask[];
}

/** Semver-ish version: birth = v1.0.0, +1 minor per month, +1 major per year. */
export function monthVersion(month: number): string {
  const m = Math.max(0, Math.min(24, Math.round(month)));
  return `v${1 + Math.floor(m / 12)}.${m % 12}.0`;
}

export const MONTHS: MonthInfo[] = [
  { month: 0, lengthCm: 50, weightG: 3400, compare: 'một chiếc MacBook Pro 16"', emoji: '💻', milestone: 'v1.0.0 lên production 🚀 — ăn, ngủ, khóc, lặp lại', mood: 'celebrate', dad: [{ t: 'Đăng ký khai sinh cho bé', l: 'chuẩn bị' }, { t: 'Thay tã & ru ngủ ca đêm cho vợ nghỉ', l: 'gắn kết' }] },
  { month: 1, lengthCm: 54, weightG: 4400, compare: 'một chú mèo con', emoji: '🐱', milestone: 'biết nhìn theo & hóng chuyện — nhận diện khuôn mặt', mood: 'wow', dad: [{ t: 'Học các tư thế bế & vỗ ợ hơi', l: 'học' }, { t: 'Đặt lịch tiêm chủng mũi đầu', l: 'sức khoẻ' }] },
  { month: 2, lengthCm: 58, weightG: 5500, compare: 'một bó hoa to', emoji: '💐', milestone: 'nụ cười xã giao đầu tiên — smile() hết là reflex 😊', mood: 'sweet', dad: [{ t: 'Bắt trọn video nụ cười đầu tiên', l: 'gắn kết' }, { t: 'Chia ca đêm để vợ ngủ đủ', l: 'sức khoẻ' }] },
  { month: 3, lengthCm: 61, weightG: 6400, compare: 'một cây đàn ukulele', emoji: '🎸', milestone: "giữ đầu vững & 'trả lời' bằng tiếng à ơi", mood: 'excited', dad: [{ t: 'Tummy time & massage cùng bé', l: 'gắn kết' }, { t: 'Soát ngân sách bỉm/sữa', l: 'tài chính' }] },
  { month: 4, lengthCm: 63, weightG: 7000, compare: 'một quả bí ngô', emoji: '🎃', milestone: 'lẫy! rollover v1.4 đã ship 🔄', mood: 'proud', dad: [{ t: 'Baby-proof: bọc cạnh bàn, ổ điện', l: 'chuẩn bị' }, { t: 'Quay clip bé lẫy', l: 'gắn kết' }] },
  { month: 5, lengthCm: 65, weightG: 7500, compare: 'chồng 3 cuốn sách dày', emoji: '📚', milestone: 'với tay tóm đồ chính xác — grab() ổn định', mood: 'determined', dad: [{ t: 'Chọn ghế ăn dặm', l: 'mua sắm' }, { t: 'Tìm hiểu thực đơn ăn dặm', l: 'học' }] },
  { month: 6, lengthCm: 67, weightG: 7900, compare: 'một bộ bàn phím cơ + chuột', emoji: '⌨️', milestone: 'ngồi vững & ăn dặm — mọc răng đầu tiên 🦷', mood: 'excited', dad: [{ t: 'Nấu bữa ăn dặm đầu tiên', l: 'gắn kết' }, { t: 'Mua gạc rơ lưỡi & ti giả mọc răng', l: 'mua sắm' }] },
  { month: 7, lengthCm: 69, weightG: 8300, compare: 'một thùng mì tôm', emoji: '🍜', milestone: 'chuyền đồ hai tay, bắt đầu lạ người', mood: 'grumpy', dad: [{ t: 'Dọn đồ trong tầm với của bé', l: 'chuẩn bị' }, { t: "Chơi ú oà giảm 'lạ người'", l: 'gắn kết' }] },
  { month: 8, lengthCm: 70, weightG: 8600, compare: 'một chiếc loa bluetooth bự', emoji: '🔊', milestone: 'bò khắp nhà — crawl() v1.0, coi chừng ổ điện', mood: 'silly', dad: [{ t: 'Lắp chặn cầu thang & cửa', l: 'chuẩn bị' }, { t: 'Bò thi cùng bé trên sàn', l: 'gắn kết' }] },
  { month: 9, lengthCm: 72, weightG: 8900, compare: 'một case PC mini-ITX', emoji: '🖥️', milestone: 'vịn đứng lên & vẫy tay bye 👋', mood: 'excited', dad: [{ t: 'Dạy vẫy tay & gọi ba-ba/ma-ma', l: 'gắn kết' }, { t: 'Khám định kỳ mốc 9 tháng', l: 'sức khoẻ' }] },
  { month: 10, lengthCm: 73, weightG: 9200, compare: 'một chiếc máy in', emoji: '🖨️', milestone: 'men theo đồ đạc đi (cruising), vỗ tay 👏', mood: 'proud', dad: [{ t: 'Mua giày tập đi', l: 'mua sắm' }, { t: 'Đọc sách tranh mỗi tối', l: 'gắn kết' }] },
  { month: 11, lengthCm: 74, weightG: 9400, compare: 'một vali cabin', emoji: '🧳', milestone: 'đứng một mình vài giây — đang tune thăng bằng', mood: 'determined', dad: [{ t: 'Dọn không gian an toàn để tập đứng', l: 'chuẩn bị' }, { t: 'Quay clip đứng một mình', l: 'gắn kết' }] },
  { month: 12, lengthCm: 76, weightG: 9600, compare: 'một máy giặt mini', emoji: '🧺', milestone: 'v2.0.0 🎂 — bước đi đầu tiên! walk() đôi khi panic', mood: 'celebrate', dad: [{ t: '🎂 Tổ chức thôi nôi v2.0.0', l: 'gắn kết' }, { t: 'Khám & tiêm mốc 12 tháng', l: 'sức khoẻ' }] },
  { month: 13, lengthCm: 77, weightG: 9800, compare: 'một thùng loa', emoji: '📦', milestone: 'đi vững hơn, mê ngăn kéo & nút bấm', mood: 'silly', dad: [{ t: 'Cất đồ dễ vỡ lên cao', l: 'chuẩn bị' }, { t: 'Đi dạo công viên tập đi', l: 'gắn kết' }] },
  { month: 14, lengthCm: 78, weightG: 10000, compare: 'một chiếc TV 32"', emoji: '📺', milestone: 'nói được vài từ đơn, chỉ tay đòi đồ', mood: 'excited', dad: [{ t: 'Dạy gọi tên đồ vật', l: 'học' }, { t: 'Mở quỹ học vấn tương lai', l: 'tài chính' }] },
  { month: 15, lengthCm: 79, weightG: 10300, compare: 'một ghế gaming nhỏ', emoji: '🪑', milestone: 'vẽ nguệch ngoạc, xếp 2 khối — UI thử nghiệm', mood: 'proud', dad: [{ t: 'Mua bút màu & giấy khổ to', l: 'mua sắm' }, { t: 'Khám định kỳ 15 tháng', l: 'sức khoẻ' }] },
  { month: 16, lengthCm: 80, weightG: 10500, compare: 'một chiếc bàn học', emoji: '🪵', milestone: 'leo trèo mọi nơi — cần baby-proof gấp', mood: 'grumpy', dad: [{ t: 'Khoá tủ, chặn ban công', l: 'chuẩn bị' }, { t: 'Chơi xếp khối cùng bé', l: 'gắn kết' }] },
  { month: 17, lengthCm: 81, weightG: 10700, compare: 'một xe đẩy hàng', emoji: '🛒', milestone: 'bắt chước việc nhà, hiểu lời nói nhiều hơn', mood: 'sweet', dad: [{ t: "Giao việc nhỏ: 'cất đồ chơi'", l: 'gắn kết' }, { t: 'Đọc sách tương tác', l: 'học' }] },
  { month: 18, lengthCm: 82, weightG: 10900, compare: 'một dàn PC full-tower', emoji: '🖥️', milestone: 'chạy, đá bóng, 10+ từ — và cơn ăn vạ đầu tiên 😤', mood: 'grumpy', dad: [{ t: 'Bình tĩnh xử lý ăn vạ — hít thở', l: 'gắn kết' }, { t: 'Tìm hiểu nhà trẻ/mầm non', l: 'học' }] },
  { month: 19, lengthCm: 83, weightG: 11100, compare: 'một tủ lạnh mini', emoji: '🧊', milestone: 'tự xúc thìa (văng tung toé), cởi được tất', mood: 'silly', dad: [{ t: 'Tập tự xúc ăn (chấp nhận bừa)', l: 'gắn kết' }, { t: 'Mua thìa & bát chống đổ', l: 'mua sắm' }] },
  { month: 20, lengthCm: 84, weightG: 11300, compare: 'một xe đạp trẻ em', emoji: '🚲', milestone: 'ghép 2 từ, chỉ đúng các bộ phận cơ thể', mood: 'excited', dad: [{ t: 'Dạy tên các bộ phận cơ thể', l: 'học' }, { t: 'Đá bóng ở sân cùng bé', l: 'gắn kết' }] },
  { month: 21, lengthCm: 85, weightG: 11500, compare: 'một chiếc máy lạnh', emoji: '❄️', milestone: 'đá bóng, làm theo lệnh đơn giản 2 bước', mood: 'determined', dad: [{ t: 'Bắt đầu làm quen bô/vệ sinh', l: 'học' }, { t: 'Khám định kỳ 21 tháng', l: 'sức khoẻ' }] },
  { month: 22, lengthCm: 86, weightG: 11800, compare: 'một server rack nhỏ', emoji: '🗄️', milestone: 'tò mò hỏi liên tục, xếp tháp khối cao', mood: 'curious', dad: [{ t: 'Kiên nhẫn trả lời 1000 câu hỏi', l: 'gắn kết' }, { t: 'Chơi giả vờ: bác sĩ, nấu ăn', l: 'gắn kết' }] },
  { month: 23, lengthCm: 86, weightG: 12000, compare: 'một tủ quần áo nhỏ', emoji: '🚪', milestone: 'nói câu 2–3 từ, chơi giả vờ thành thạo', mood: 'sweet', dad: [{ t: 'Đọc câu chuyện dài hơn mỗi tối', l: 'học' }, { t: 'Soát lại ngân sách năm tới', l: 'tài chính' }] },
  { month: 24, lengthCm: 87, weightG: 12200, compare: 'một con người nhỏ hoàn chỉnh', emoji: '🧒', milestone: "v3.0.0 🎂 — chạy nhảy, 50+ từ, cái gì cũng 'KHÔNG!'", mood: 'celebrate', dad: [{ t: '🎂 Mừng sinh nhật 2 tuổi v3.0.0', l: 'gắn kết' }, { t: 'Tìm hiểu & đăng ký trường mầm non', l: 'học' }] },
];

const BY_MONTH = new Map(MONTHS.map((m) => [m.month, m]));
export const getMonth = (month: number): MonthInfo =>
  BY_MONTH.get(Math.max(0, Math.min(24, Math.round(month)))) ?? MONTHS[0];

// general newborn/infant tasks mixed into every month for more than the 2 specific ones
const EVERGREEN_POST: DadTask[] = [
  { t: 'Thay tã cho bé một lần hôm nay', l: 'gắn kết' },
  { t: 'Ru bé ngủ để vợ chợp mắt', l: 'gắn kết' },
  { t: 'Lo cữ đêm để vợ ngủ một giấc dài', l: 'sức khoẻ' },
  { t: 'Da kề da với bé 15 phút', l: 'gắn kết' },
  { t: 'Hát hoặc đọc cho bé nghe', l: 'gắn kết' },
  { t: 'Rửa & tiệt trùng bình/đồ của bé', l: 'sức khoẻ' },
  { t: 'Đưa bé đi dạo cho vợ nghỉ', l: 'gắn kết' },
  { t: 'Hỏi vợ cần gì hôm nay rồi làm giúp', l: 'gắn kết' },
  { t: 'Chụp một tấm ảnh bé hôm nay 📸', l: 'gắn kết' },
  { t: 'Kiểm tra đồ sắp hết (tã, sữa)', l: 'mua sắm' },
  { t: 'Cùng vợ ăn một bữa tử tế', l: 'sức khoẻ' },
  { t: 'Ghi lại một cột mốc mới của bé', l: 'học' },
  { t: 'Cho vợ ít phút riêng / tắm lâu hơn', l: 'gắn kết' },
  { t: 'Dọn dẹp khu vực chơi của bé', l: 'chuẩn bị' },
  { t: 'Bỏ thêm vào quỹ học vấn của bé', l: 'tài chính' },
];

/** A month's 2 specific dad tasks + 3 rotating evergreen ones. */
export const monthDadTasks = (month: number): DadTask[] => {
  const m = Math.max(0, Math.min(24, Math.round(month)));
  return [...getMonth(m).dad, ...pickEvergreen(EVERGREEN_POST, m, 3)];
};

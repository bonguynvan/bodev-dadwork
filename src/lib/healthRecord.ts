/**
 * Build a clean, printable health record (growth + vaccines + milestones) and
 * open it in a new window for printing / save-as-PDF — handy for doctor visits.
 * All data is read locally; nothing is uploaded.
 */
import { loadGrowth, loadVaccines, loadMilestones } from './persist';
import { VACCINE_SCHEDULE, ageLabel } from './vaccines';
import { MILESTONES } from './milestones';

const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

export function printHealthRecord(opts: { babyName?: string; month: number; version: string }): void {
  const name = opts.babyName ? `Bé ${opts.babyName}` : 'Bé';
  const growth = loadGrowth().slice().sort((a, b) => a.month - b.month);
  const vax = loadVaccines();
  const ms = loadMilestones();
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const growthRows = growth.length
    ? growth
        .map(
          (g) =>
            `<tr><td>tháng ${g.month}</td><td>${g.weightKg != null ? g.weightKg + ' kg' : '—'}</td><td>${g.heightCm != null ? g.heightCm + ' cm' : '—'}</td></tr>`,
        )
        .join('')
    : `<tr><td colspan="3" class="muted">chưa có số liệu</td></tr>`;

  const vaxMonths = [...new Set(VACCINE_SCHEDULE.map((v) => v.month))].sort((a, b) => a - b);
  const vaxHtml = vaxMonths
    .map((m) => {
      const items = VACCINE_SCHEDULE.filter((v) => v.month === m)
        .map((v) => `<li class="${vax[v.id] ? 'done' : ''}">${vax[v.id] ? '☑' : '☐'} ${esc(v.name)}</li>`)
        .join('');
      return `<div class="grp"><h4>${ageLabel(m)}</h4><ul>${items}</ul></div>`;
    })
    .join('');

  const msDone = MILESTONES.filter((m) => ms[m.id]);
  const msHtml = msDone.length
    ? `<ul class="ms">${msDone.map((m) => `<li>☑ ${esc(m.emoji)} ${esc(m.name)}</li>`).join('')}</ul>`
    : `<p class="muted">chưa đánh dấu cột mốc nào</p>`;

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<title>Hồ sơ sức khoẻ ${esc(name)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;margin:32px;line-height:1.5}
  h1{font-size:22px;margin:0 0 2px}
  .sub{color:#6b6b6b;font-size:13px;margin-bottom:20px}
  h3{font-size:15px;border-bottom:2px solid #1d9e75;padding-bottom:4px;margin:22px 0 10px;color:#15795a}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:5px 8px;border-bottom:1px solid #eee}
  th{color:#6b6b6b;font-weight:600}
  .grp{display:inline-block;vertical-align:top;width:32%;margin:0 1% 10px 0}
  .grp h4{font-size:12px;color:#6b6b6b;margin:0 0 4px}
  ul{list-style:none;padding:0;margin:0;font-size:12.5px}
  ul.ms li{padding:2px 0}
  li{padding:1px 0}
  li.done{color:#15795a}
  .muted{color:#9a9a9a}
  footer{margin-top:28px;color:#9a9a9a;font-size:11px;border-top:1px solid #eee;padding-top:8px}
  @media print{body{margin:12mm}}
</style></head><body>
  <h1>Hồ sơ sức khoẻ — ${esc(name)}</h1>
  <div class="sub">${opts.month >= 0 ? opts.month + ' tháng tuổi · ' : ''}${esc(opts.version)} · in ngày ${dateStr}</div>
  <h3>Tăng trưởng</h3>
  <table><thead><tr><th>Tuổi</th><th>Cân nặng</th><th>Chiều cao</th></tr></thead><tbody>${growthRows}</tbody></table>
  <h3>Tiêm chủng</h3>
  <div>${vaxHtml}</div>
  <h3>Cột mốc đã đạt</h3>
  ${msHtml}
  <footer>Tạo từ bodev.vn / ship.log — bản tham khảo cá nhân, không thay hồ sơ y tế chính thức.</footer>
</body></html>`;

  const win = window.open('', '_blank', 'width=820,height=1000');
  if (!win) return; // popup blocked
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      /* print dialog unavailable */
    }
  }, 350);
}

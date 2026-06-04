import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { you } from '../../lib/store';
import { printHealthRecord } from '../../lib/healthRecord';
import KickCounter from './KickCounter';
import BabyLog from './BabyLog';
import GrowthTracker from './GrowthTracker';
import VaccineSchedule from './VaccineSchedule';
import Milestones from './Milestones';

interface Props {
  womb: boolean;
  month: number;
  week: number;
  version: string;
}

interface Tab {
  key: string;
  label: string;
  render: () => ComponentChildren;
}

export default function BabyTools({ womb, month, week, version }: Props) {
  const [active, setActive] = useState('today');

  const tabs: Tab[] = womb
    ? week >= 16
      ? [{ key: 'kick', label: '👟 đếm cú đạp', render: () => <KickCounter /> }]
      : []
    : [
        { key: 'today', label: '📋 hôm nay', render: () => <BabyLog /> },
        { key: 'growth', label: '📈 tăng trưởng', render: () => <GrowthTracker month={month} /> },
        { key: 'vax', label: '💉 tiêm chủng', render: () => <VaccineSchedule month={month} /> },
        { key: 'milestone', label: '🌱 cột mốc', render: () => <Milestones month={month} /> },
      ];

  if (tabs.length === 0) return null;
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div class="mt-8 max-w-3xl">
      {tabs.length > 1 && (
        <div class="mb-3 flex flex-wrap items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              aria-pressed={activeTab.key === t.key}
              class={`rounded-full px-3 py-1.5 font-mono text-xs transition-colors ${
                activeTab.key === t.key
                  ? 'bg-accent text-white'
                  : 'border border-hair/15 text-muted hover:border-hair/25 hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => printHealthRecord({ babyName: you.value?.babyName, month, version })}
            title="In / lưu hồ sơ sức khoẻ (PDF)"
            class="ml-auto rounded-full border border-hair/15 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent-ink"
          >
            📄 in hồ sơ
          </button>
        </div>
      )}
      {activeTab.render()}
    </div>
  );
}

const LEVEL = ['bg-hair/[0.05]', 'bg-accent/25', 'bg-accent/60', 'bg-accent'];

export default function HeatGrid({ levels, todayIndex }: { levels: number[]; todayIndex?: number }) {
  return (
    <div class="term-scroll overflow-x-auto pb-1">
      <div class="grid grid-flow-col grid-rows-7 gap-1" style={{ width: 'max-content' }}>
        {levels.map((lv, i) => (
          <span
            key={i}
            class={`h-2.5 w-2.5 rounded-[3px] ${LEVEL[lv] ?? LEVEL[0]} ${
              i === todayIndex ? 'ring-1 ring-accent ring-offset-1 ring-offset-white' : ''
            }`}
          />
        ))}
      </div>
      <div class="mt-2 flex items-center justify-end gap-1.5 font-mono text-[0.65rem] text-muted">
        <span>ít</span>
        {LEVEL.map((l, i) => (
          <span key={i} class={`h-2.5 w-2.5 rounded-[3px] ${l}`} />
        ))}
        <span>nhiều</span>
      </div>
    </div>
  );
}

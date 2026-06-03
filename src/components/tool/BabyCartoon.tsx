import type { JSX } from 'preact';
import { clampStage, monthOf } from '../../lib/stages';
import type { Mood } from '../../lib/pregnancy';
import { mulberry32, hashString } from '../../lib/prng';

interface Props {
  stage: number; // 4..65 timeline value
  mood: Mood;
  phase: 'womb' | 'born';
  size?: number;
}

const OUTLINE = '#5b3d34';
const SKIN = '#ffc9ae';
const SHADE = '#f3b59a';
const CHEEK = '#ff8f7e';
const HP = '#3a3442';
const TONGUE = '#ff8fa0';
const PUP = '#2a2018';

interface M {
  ex: number;
  ey: number;
  er: number;
  pr: number;
  browY: number;
  bw: number;
  my: number;
  mw: number;
  md: number;
  sw: number;
  swb: number;
}
function metrics(cy: number, r: number): M {
  return {
    ex: r * 0.34,
    ey: cy - r * 0.1,
    er: r * 0.27,
    pr: r * 0.27 * 0.46,
    browY: cy - r * 0.5,
    bw: r * 0.27 * 0.8,
    my: cy + r * 0.24,
    mw: r * 0.5,
    md: r * 0.34,
    sw: r * 0.06,
    swb: r * 0.075,
  };
}
const eyeWhite = (cx: number, m: M) => (
  <circle cx={cx} cy={m.ey} r={m.er} fill="#fff" stroke={OUTLINE} stroke-width={m.er * 0.2} />
);

type Part = (m: M) => JSX.Element;
type Extra = (m: M) => JSX.Element | null;
type EyeKey = 'googly' | 'wink' | 'surprised' | 'dizzy' | 'side' | 'sleepy';
type MouthKey = 'grin' | 'bigD' | 'oh' | 'blep' | 'wavy' | 'cat' | 'frown';
type BrowKey = 'asym' | 'up' | 'flat' | 'angry';
type ExtraKey = 'sweat' | 'q' | 'excl' | 'sparkle' | 'zzz' | 'none';

const EYE: Record<EyeKey, Part> = {
  googly: (m) => (
    <g>
      {eyeWhite(-m.ex, m)}
      {eyeWhite(m.ex, m)}
      <circle cx={-m.ex + m.pr * 0.7} cy={m.ey + m.pr * 0.5} r={m.pr} fill={PUP} />
      <circle cx={m.ex - m.pr * 0.2} cy={m.ey + m.pr * 0.9} r={m.pr} fill={PUP} />
      <circle cx={-m.ex + m.pr * 0.2} cy={m.ey} r={m.pr * 0.34} fill="#fff" />
      <circle cx={m.ex - m.pr * 0.7} cy={m.ey + m.pr * 0.4} r={m.pr * 0.34} fill="#fff" />
    </g>
  ),
  wink: (m) => (
    <g>
      <path
        d={`M ${-m.ex - m.bw} ${m.ey} q ${m.bw} ${-m.bw} ${m.bw * 2} 0`}
        fill="none"
        stroke={OUTLINE}
        stroke-width={m.sw}
        stroke-linecap="round"
      />
      {eyeWhite(m.ex, m)}
      <circle cx={m.ex} cy={m.ey + m.pr * 0.4} r={m.pr} fill={PUP} />
      <circle cx={m.ex - m.pr * 0.5} cy={m.ey - m.pr * 0.2} r={m.pr * 0.34} fill="#fff" />
    </g>
  ),
  surprised: (m) => (
    <g>
      <circle cx={-m.ex} cy={m.ey} r={m.er * 1.12} fill="#fff" stroke={OUTLINE} stroke-width={m.er * 0.2} />
      <circle cx={m.ex} cy={m.ey} r={m.er * 1.12} fill="#fff" stroke={OUTLINE} stroke-width={m.er * 0.2} />
      <circle cx={-m.ex} cy={m.ey - m.pr * 0.3} r={m.pr * 0.72} fill={PUP} />
      <circle cx={m.ex} cy={m.ey - m.pr * 0.3} r={m.pr * 0.72} fill={PUP} />
    </g>
  ),
  dizzy: (m) => (
    <g stroke={PUP} stroke-width={m.sw} stroke-linecap="round">
      <line x1={-m.ex - m.er * 0.6} y1={m.ey - m.er * 0.6} x2={-m.ex + m.er * 0.6} y2={m.ey + m.er * 0.6} />
      <line x1={-m.ex + m.er * 0.6} y1={m.ey - m.er * 0.6} x2={-m.ex - m.er * 0.6} y2={m.ey + m.er * 0.6} />
      <line x1={m.ex - m.er * 0.6} y1={m.ey - m.er * 0.6} x2={m.ex + m.er * 0.6} y2={m.ey + m.er * 0.6} />
      <line x1={m.ex + m.er * 0.6} y1={m.ey - m.er * 0.6} x2={m.ex - m.er * 0.6} y2={m.ey + m.er * 0.6} />
    </g>
  ),
  side: (m) => (
    <g>
      {eyeWhite(-m.ex, m)}
      {eyeWhite(m.ex, m)}
      <circle cx={-m.ex + m.pr * 1.1} cy={m.ey} r={m.pr} fill={PUP} />
      <circle cx={m.ex + m.pr * 1.1} cy={m.ey} r={m.pr} fill={PUP} />
    </g>
  ),
  sleepy: (m) => (
    <g fill="none" stroke={OUTLINE} stroke-width={m.sw} stroke-linecap="round">
      <line x1={-m.ex - m.er * 0.8} y1={m.ey} x2={-m.ex + m.er * 0.8} y2={m.ey} />
      <path d={`M ${-m.ex - m.er * 0.7} ${m.ey} q ${m.er * 0.7} ${m.er * 0.7} ${m.er * 1.4} 0`} />
      <line x1={m.ex - m.er * 0.8} y1={m.ey} x2={m.ex + m.er * 0.8} y2={m.ey} />
      <path d={`M ${m.ex - m.er * 0.7} ${m.ey} q ${m.er * 0.7} ${m.er * 0.7} ${m.er * 1.4} 0`} />
    </g>
  ),
};

const MOUTH: Record<MouthKey, Part> = {
  grin: (m) => (
    <g>
      <path
        d={`M ${-m.mw} ${m.my} Q 0 ${m.my + m.md} ${m.mw} ${m.my} Q 0 ${m.my + m.md * 0.3} ${-m.mw} ${m.my} Z`}
        fill={OUTLINE}
      />
      <ellipse cx={0} cy={m.my + m.md * 0.5} rx={m.mw * 0.42} ry={m.md * 0.32} fill={TONGUE} />
      <rect x={-m.mw * 0.18} y={m.my - m.md * 0.06} width={m.mw * 0.36} height={m.md * 0.35} rx={2} fill="#fff" />
    </g>
  ),
  bigD: (m) => (
    <g>
      <path d={`M ${-m.mw} ${m.my - 2} Q 0 ${m.my + m.md * 1.5} ${m.mw} ${m.my - 2} Z`} fill={OUTLINE} />
      <path
        d={`M ${-m.mw * 0.8} ${m.my - 1} L ${m.mw * 0.8} ${m.my - 1} L ${m.mw * 0.66} ${m.my + m.md * 0.4} L ${-m.mw * 0.66} ${m.my + m.md * 0.4} Z`}
        fill="#fff"
      />
    </g>
  ),
  oh: (m) => <ellipse cx={0} cy={m.my + m.md * 0.35} rx={m.mw * 0.3} ry={m.md * 0.55} fill={OUTLINE} />,
  blep: (m) => (
    <g>
      <path
        d={`M ${-m.mw * 0.7} ${m.my} q ${m.mw * 0.7} ${m.md * 0.7} ${m.mw * 1.4} 0`}
        fill="none"
        stroke={OUTLINE}
        stroke-width={m.sw}
        stroke-linecap="round"
      />
      <path
        d={`M ${-m.mw * 0.2} ${m.my + m.md * 0.35} q ${m.mw * 0.2} ${m.md * 0.6} ${m.mw * 0.4} 0 z`}
        fill={TONGUE}
        stroke={OUTLINE}
        stroke-width={m.sw * 0.7}
      />
    </g>
  ),
  wavy: (m) => (
    <path
      d={`M ${-m.mw} ${m.my + m.md * 0.3} q ${m.mw * 0.5} ${-m.md * 0.5} ${m.mw} 0 q ${m.mw * 0.5} ${m.md * 0.5} ${m.mw} 0`}
      fill="none"
      stroke={OUTLINE}
      stroke-width={m.sw}
      stroke-linecap="round"
    />
  ),
  cat: (m) => (
    <path
      d={`M ${-m.mw * 0.7} ${m.my} q ${m.mw * 0.35} ${m.md * 0.7} ${m.mw * 0.7} 0 q ${m.mw * 0.35} ${m.md * 0.7} ${m.mw * 0.7} 0`}
      fill="none"
      stroke={OUTLINE}
      stroke-width={m.sw}
      stroke-linecap="round"
    />
  ),
  frown: (m) => (
    <path
      d={`M ${-m.mw * 0.7} ${m.my + m.md * 0.2} q ${m.mw * 0.7} ${-m.md * 0.6} ${m.mw * 1.4} 0`}
      fill="none"
      stroke={OUTLINE}
      stroke-width={m.sw}
      stroke-linecap="round"
    />
  ),
};

const BROW: Record<BrowKey, Part> = {
  asym: (m) => (
    <g stroke={OUTLINE} stroke-width={m.swb} stroke-linecap="round">
      <line x1={-m.ex - m.bw} y1={m.browY + 2} x2={-m.ex + m.bw} y2={m.browY} />
      <line x1={m.ex - m.bw} y1={m.browY} x2={m.ex + m.bw} y2={m.browY - m.md * 0.5} />
    </g>
  ),
  up: (m) => (
    <g fill="none" stroke={OUTLINE} stroke-width={m.swb} stroke-linecap="round">
      <path d={`M ${-m.ex - m.bw} ${m.browY} q ${m.bw} ${-m.md * 0.4} ${m.bw * 2} 0`} />
      <path d={`M ${m.ex - m.bw} ${m.browY} q ${m.bw} ${-m.md * 0.4} ${m.bw * 2} 0`} />
    </g>
  ),
  flat: (m) => (
    <g stroke={OUTLINE} stroke-width={m.swb} stroke-linecap="round">
      <line x1={-m.ex - m.bw} y1={m.browY} x2={-m.ex + m.bw} y2={m.browY} />
      <line x1={m.ex - m.bw} y1={m.browY} x2={m.ex + m.bw} y2={m.browY} />
    </g>
  ),
  angry: (m) => (
    <g stroke={OUTLINE} stroke-width={m.swb} stroke-linecap="round">
      <line x1={-m.ex - m.bw} y1={m.browY - m.md * 0.35} x2={-m.ex + m.bw} y2={m.browY + 2} />
      <line x1={m.ex - m.bw} y1={m.browY + 2} x2={m.ex + m.bw} y2={m.browY - m.md * 0.35} />
    </g>
  ),
};

const EXTRA: Record<ExtraKey, Extra> = {
  none: () => null,
  sweat: (m) => (
    <path
      d={`M ${m.ex * 2.4} ${m.browY} q ${m.bw * 0.7} ${m.md * 0.6} 0 ${m.md * 0.9} q ${-m.bw * 0.7} ${-m.md * 0.3} 0 ${-m.md * 0.9} z`}
      fill="#a9d8ff"
      stroke="#6ab0e8"
      stroke-width={m.sw * 0.4}
    />
  ),
  q: (m) => (
    <text x={m.ex * 2.3} y={m.browY} font-size={m.md * 1.5} font-family="'JetBrains Mono', monospace" font-weight="700" fill={OUTLINE}>
      ?
    </text>
  ),
  excl: (m) => (
    <text x={m.ex * 2.3} y={m.browY} font-size={m.md * 1.5} font-family="'JetBrains Mono', monospace" font-weight="700" fill="#e5534b">
      !
    </text>
  ),
  sparkle: (m) => (
    <path
      d={`M ${m.ex * 2.4} ${m.browY - m.md * 0.4} l ${m.md * 0.22} ${m.md * 0.5} l ${m.md * 0.5} ${m.md * 0.22} l ${-m.md * 0.5} ${m.md * 0.22} l ${-m.md * 0.22} ${m.md * 0.5} l ${-m.md * 0.22} ${-m.md * 0.5} l ${-m.md * 0.5} ${-m.md * 0.22} l ${m.md * 0.5} ${-m.md * 0.22} z`}
      fill="#ffd34d"
    />
  ),
  zzz: (m) => (
    <text x={m.ex * 2.0} y={m.browY - m.md * 0.1} font-size={m.md} font-family="'JetBrains Mono', monospace" font-weight="700" fill={OUTLINE} opacity="0.7">
      z
    </text>
  ),
};

interface Preset {
  eye: EyeKey | EyeKey[];
  mouth: MouthKey;
  brow: BrowKey;
  extras: ExtraKey[];
}
const MOOD: Record<Mood, Preset> = {
  sweet: { eye: 'wink', mouth: 'cat', brow: 'asym', extras: ['sparkle', 'none'] },
  excited: { eye: 'surprised', mouth: 'bigD', brow: 'up', extras: ['sparkle', 'excl'] },
  proud: { eye: 'side', mouth: 'grin', brow: 'asym', extras: ['none', 'sparkle'] },
  determined: { eye: 'surprised', mouth: 'grin', brow: 'angry', extras: ['excl', 'none'] },
  silly: { eye: ['googly', 'dizzy'], mouth: 'blep', brow: 'asym', extras: ['none', 'q'] },
  sleepy: { eye: 'sleepy', mouth: 'cat', brow: 'flat', extras: ['zzz'] },
  wow: { eye: 'surprised', mouth: 'oh', brow: 'up', extras: ['excl'] },
  grumpy: { eye: 'side', mouth: 'frown', brow: 'angry', extras: ['none', 'sweat'] },
  curious: { eye: 'side', mouth: 'wavy', brow: 'asym', extras: ['q'] },
  celebrate: { eye: 'surprised', mouth: 'bigD', brow: 'up', extras: ['sparkle'] },
};

function GoofyFace({ mood, seed, cy, r }: { mood: Mood; seed: number; cy: number; r: number }) {
  const m = metrics(cy, r);
  const p = MOOD[mood];
  const rng = mulberry32(hashString('mood-' + seed));
  const eyeKey = Array.isArray(p.eye) ? p.eye[Math.floor(rng() * p.eye.length)] : p.eye;
  const extraKey = p.extras[Math.floor(rng() * p.extras.length)];
  return (
    <g>
      {BROW[p.brow](m)}
      {EYE[eyeKey](m)}
      <circle cx={-r * 0.62} cy={cy + r * 0.1} r={r * 0.18} fill={CHEEK} opacity="0.55" />
      <circle cx={r * 0.62} cy={cy + r * 0.1} r={r * 0.18} fill={CHEEK} opacity="0.55" />
      {MOUTH[p.mouth](m)}
      {EXTRA[extraKey](m)}
    </g>
  );
}

const Coffee = () => (
  <>
    <g stroke="#c9c2bb" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path d="M-3 -10 q 4 -4 0 -8" />
      <path d="M4 -10 q 4 -4 0 -8" />
    </g>
    <rect x="-8" y="-6" width="16" height="14" rx="3" fill="#fff7ee" stroke={OUTLINE} stroke-width="2.6" />
    <path d="M8 -3 q 6 1 0 8" fill="none" stroke={OUTLINE} stroke-width="2.4" />
  </>
);

/** Head + lo-fi headphones + cowlick + the mood face, scaled to (cy, r). */
function HeadUnit({ mood, seed, cy, r }: { mood: Mood; seed: number; cy: number; r: number }) {
  return (
    <>
      <g fill={HP} stroke={OUTLINE} stroke-width={r * 0.06}>
        <ellipse cx={-r * 0.99} cy={cy} rx={r * 0.22} ry={r * 0.36} />
        <ellipse cx={r * 0.99} cy={cy} rx={r * 0.22} ry={r * 0.36} />
      </g>
      <circle cx={0} cy={cy} r={r} fill={SKIN} stroke={OUTLINE} stroke-width={r * 0.072} />
      <path
        d={`M ${-r * 0.99} ${cy - r * 0.08} Q 0 ${cy - r * 1.5} ${r * 0.99} ${cy - r * 0.08}`}
        fill="none"
        stroke={HP}
        stroke-width={r * 0.14}
        stroke-linecap="round"
      />
      <path
        d={`M ${r * 0.02} ${cy - r + 3} q ${r * 0.32} ${-r * 0.2} ${r * 0.14} ${-r * 0.52} q ${-r * 0.06} ${r * 0.26} ${-r * 0.3} ${r * 0.18}`}
        fill="none"
        stroke={OUTLINE}
        stroke-width={r * 0.08}
        stroke-linecap="round"
      />
      <GoofyFace mood={mood} seed={seed} cy={cy} r={r} />
    </>
  );
}

/** sitting — womb full-term + months 4–9 */
function FullBaby({ mood, seed }: { mood: Mood; seed: number }) {
  return (
    <>
      <ellipse cx="0" cy="44" rx="42" ry="40" fill="url(#belly)" stroke={OUTLINE} stroke-width="3.4" />
      <g fill={SKIN} stroke={OUTLINE} stroke-width="3.2">
        <ellipse cx="-42" cy="36" rx="13" ry="19" transform="rotate(24 -42 36)" />
        <ellipse cx="42" cy="36" rx="13" ry="19" transform="rotate(-24 42 36)" />
        <ellipse cx="-17" cy="82" rx="14" ry="11" />
        <ellipse cx="17" cy="82" rx="14" ry="11" />
      </g>
      <g transform="translate(56 28)">
        <Coffee />
      </g>
      <HeadUnit mood={mood} seed={seed} cy={-22} r={50} />
    </>
  );
}

/** swaddled newborn — months 0–3 */
function Swaddle({ mood, seed }: { mood: Mood; seed: number }) {
  return (
    <>
      <ellipse cx="0" cy="42" rx="40" ry="50" fill="#cfe6ff" stroke={OUTLINE} stroke-width="3.4" />
      <g fill="none" stroke="#8fb8e0" stroke-width="3" stroke-linecap="round">
        <path d="M -34 18 Q 0 32 34 18" />
        <path d="M -30 52 Q 0 64 30 52" />
      </g>
      <HeadUnit mood={mood} seed={seed} cy={-36} r={44} />
    </>
  );
}

/** standing / walking toddler — months 10–24 */
function Stand({ mood, seed }: { mood: Mood; seed: number }) {
  return (
    <>
      <g fill={SKIN} stroke={OUTLINE} stroke-width="3.2">
        <ellipse cx="-15" cy="56" rx="12" ry="26" />
        <ellipse cx="15" cy="56" rx="12" ry="26" />
        <ellipse cx="-15" cy="84" rx="14" ry="9" />
        <ellipse cx="15" cy="84" rx="14" ry="9" />
        <ellipse cx="-37" cy="8" rx="12" ry="20" transform="rotate(22 -37 8)" />
        <ellipse cx="37" cy="8" rx="12" ry="20" transform="rotate(-22 37 8)" />
      </g>
      <ellipse cx="0" cy="16" rx="32" ry="33" fill="url(#belly)" stroke={OUTLINE} stroke-width="3.4" />
      <g transform="translate(46 16)">
        <Coffee />
      </g>
      <HeadUnit mood={mood} seed={seed} cy={-30} r={44} />
    </>
  );
}

export default function BabyCartoon({ stage, mood, phase, size = 360 }: Props) {
  const v = clampStage(stage);
  const born = phase === 'born';
  const month = born ? monthOf(v) : 0;
  const t = (v - 4) / 36;
  const s = born ? Math.min(1.2, 1.04 + month * 0.006) : 0.6 + 0.55 * t;
  const isEmbryo = !born && v < 9;
  const cy = born ? 120 : 122;

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      class="h-full w-full select-none"
      role="img"
      aria-label={`bé minh hoạ ${born ? `tháng ${month}` : `tuần ${v}`}`}
    >
      <defs>
        <radialGradient id="bubble" cx="50%" cy="44%" r="58%">
          <stop offset="0%" stop-color="#eafaf3" />
          <stop offset="55%" stop-color="#d6f3e7" />
          <stop offset="100%" stop-color="#bfeede" stop-opacity="0.35" />
        </radialGradient>
        <radialGradient id="nursery" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stop-color="#fff5ec" />
          <stop offset="60%" stop-color="#ffe7d6" />
          <stop offset="100%" stop-color="#ffd9c4" stop-opacity="0.5" />
        </radialGradient>
        <radialGradient id="belly" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stop-color={SKIN} />
          <stop offset="100%" stop-color={SHADE} />
        </radialGradient>
      </defs>

      {born ? (
        <>
          <circle cx="120" cy="118" r="108" fill="url(#nursery)" />
          <circle cx="120" cy="118" r="108" fill="none" stroke="#ffb38f" stroke-width="2" opacity="0.3" />
          {/* playmat */}
          <ellipse cx="120" cy="210" rx="90" ry="18" fill="#bfe6d6" opacity="0.85" />
          <ellipse cx="120" cy="210" rx="90" ry="18" fill="none" stroke="#2fd29a" stroke-width="2" opacity="0.3" />
          {/* toys / stars */}
          <g opacity="0.8">
            <path d="M58 70 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#ffd34d" />
            <circle cx="184" cy="92" r="6" fill="#ff9aa8" />
            <rect x="176" y="150" width="12" height="12" rx="2" fill="#7fc6ff" transform="rotate(12 182 156)" />
          </g>
        </>
      ) : (
        <>
          <circle cx="120" cy="118" r="108" fill="url(#bubble)" />
          <circle cx="120" cy="118" r="108" fill="none" stroke="#2fd29a" stroke-width="2" opacity="0.25" />
          <circle cx="86" cy="74" r="26" fill="#ffffff" opacity="0.18" />
          <g fill="#ffffff" opacity="0.7">
            <circle cx="170" cy="80" r="2.4" />
            <circle cx="64" cy="150" r="2" />
            <circle cx="182" cy="150" r="1.8" />
            <circle cx="92" cy="186" r="2.2" />
          </g>
        </>
      )}

      <g transform={`translate(120 ${cy})`}>
        <g class="baby-float">
          <g transform={`scale(${s})`}>
            {isEmbryo ? (
              <>
                <path
                  d="M2 14 q 30 6 30 36 q 0 22 -22 22 q 14 -10 8 -26 q -6 -12 -22 -10 z"
                  fill="url(#belly)"
                  stroke={OUTLINE}
                  stroke-width="3.4"
                  stroke-linejoin="round"
                />
                <circle cx="0" cy="-10" r="44" fill={SKIN} stroke={OUTLINE} stroke-width="3.6" />
                <GoofyFace mood={mood} seed={v} cy={-10} r={44} />
              </>
            ) : born ? (
              month <= 3 ? (
                <Swaddle mood={mood} seed={v} />
              ) : month <= 9 ? (
                <FullBaby mood={mood} seed={v} />
              ) : (
                <Stand mood={mood} seed={v} />
              )
            ) : (
              <FullBaby mood={mood} seed={v} />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}

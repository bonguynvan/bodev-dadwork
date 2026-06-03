import { hashString } from '../../lib/prng';
import { you } from '../../lib/store';

const PALETTE = ['#1D9E75', '#3B82F6', '#7C5CFF', '#E0A800', '#E5534B', '#0EA5A0', '#15795A'];

interface Props {
  handle: string;
  size?: number;
  /** explicit photo override; otherwise the current user's uploaded avatar is used */
  src?: string;
}

/** Uploaded photo when available, else a deterministic 5×5 symmetric pixel identicon. */
export default function Avatar({ handle, size = 28, src }: Props) {
  const photo = src ?? (you.value?.handle === handle ? you.value?.avatar : undefined);
  if (photo) {
    return (
      <img
        src={photo}
        width={size}
        height={size}
        alt={`avatar ${handle}`}
        loading="lazy"
        decoding="async"
        class="shrink-0 rounded object-cover"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  const h = hashString(handle);
  const color = PALETTE[h % PALETTE.length];
  const u = size / 5;

  const cells: [number, number][] = [];
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      if ((h >> (y * 3 + x)) & 1) {
        cells.push([x, y]);
        if (x < 2) cells.push([4 - x, y]);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      class="shrink-0 rounded"
      role="img"
      aria-label={`avatar ${handle}`}
    >
      <rect width={size} height={size} rx={size * 0.16} fill="#0f1417" />
      {cells.map(([x, y], i) => (
        <rect key={i} x={x * u} y={y * u} width={u + 0.4} height={u + 0.4} fill={color} />
      ))}
    </svg>
  );
}

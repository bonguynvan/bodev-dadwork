import type { CommitType } from '../../lib/types';
import { TAG_CLASS } from '../../lib/tags';

export default function CommitTag({ type }: { type: CommitType }) {
  return (
    <span
      class={`inline-flex items-center rounded font-mono text-[0.7rem] font-medium leading-none px-1.5 py-1 ${TAG_CLASS[type]}`}
    >
      {type}
    </span>
  );
}

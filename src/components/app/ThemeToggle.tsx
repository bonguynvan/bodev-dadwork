import { useState, useEffect } from 'preact/hooks';

interface Props {
  class?: string;
}

/**
 * Sun/moon toggle. The canonical theme state lives on `window.__theme`
 * (defined by the inline no-FOUC script in BaseLayout) so this works
 * identically across every island and static page.
 */
export default function ThemeToggle({ class: cls }: Props) {
  const [eff, setEff] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setEff(window.__theme?.effective() ?? 'light');
    const onChange = () => setEff(window.__theme?.effective() ?? 'light');
    addEventListener('theme-change', onChange);
    return () => removeEventListener('theme-change', onChange);
  }, []);

  const isDark = eff === 'dark';
  return (
    <button
      type="button"
      onClick={() => window.__theme?.toggle()}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
      class={
        cls ??
        'inline-flex h-7 w-7 items-center justify-center rounded-full border border-hair/10 text-muted transition-colors hover:border-hair/20 hover:text-ink'
      }
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}

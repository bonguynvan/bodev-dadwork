/// <reference types="astro/client" />

type ThemePref = 'light' | 'dark' | 'system';

interface ThemeApi {
  get(): ThemePref;
  effective(): 'light' | 'dark';
  set(pref: ThemePref): void;
  toggle(): void;
}

interface Window {
  __theme?: ThemeApi;
}

import { AppearanceSettings } from '../types';
import { initialAppearanceSettings } from '../data/settingsMockData';

export const APPEARANCE_STORAGE_KEY = 'liferpg-appearance-settings';
export const THEME_STORAGE_KEY = 'liferpg-theme';

/**
 * Converts a 3 or 6 digit hex color to an [r, g, b] tuple.
 */
export function hexToRgb(hex: string): [number, number, number] {
  let cleaned = hex.replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleaned.length !== 6) {
    return [108, 99, 255]; // fallback default purple
  }
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Adjusts color brightness by percent (-100 to 100).
 */
export function adjustBrightness(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const factor = (100 + percent) / 100;
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0');
  return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
}

/**
 * Determine if dark mode is effective based on appearance settings and OS preferences.
 */
export function isDarkModeActive(settings: AppearanceSettings): boolean {
  if (settings.theme === 'dark') return true;
  if (settings.theme === 'light') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
}

/**
 * Load saved appearance settings from localStorage with safe fallback.
 */
export function getStoredAppearance(): AppearanceSettings {
  if (typeof window === 'undefined') return initialAppearanceSettings;

  try {
    const stored = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...initialAppearanceSettings,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Error reading appearance settings from localStorage', err);
  }

  // Check legacy theme key if present
  try {
    const legacyTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (legacyTheme === 'light' || legacyTheme === 'dark' || legacyTheme === 'system') {
      return {
        ...initialAppearanceSettings,
        theme: legacyTheme,
      };
    }
  } catch {
    // Ignore
  }

  return initialAppearanceSettings;
}

/**
 * Apply the appearance settings to the DOM (HTML/Body classes, data attributes, CSS variables)
 * and persist into localStorage.
 * Returns whether dark mode is currently effective.
 */
export function applyAppearanceToDOM(settings: AppearanceSettings): boolean {
  if (typeof document === 'undefined') return true;

  const root = document.documentElement;
  const body = document.body;
  const darkEffective = isDarkModeActive(settings);

  // 1. Theme class & data attributes
  if (darkEffective) {
    root.classList.add('dark');
    root.classList.remove('light');
    body?.classList.add('dark');
    body?.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    body?.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    body?.classList.remove('dark');
    body?.classList.add('light');
    root.setAttribute('data-theme', 'light');
    body?.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
  root.setAttribute('data-theme-mode', settings.theme);

  // 2. Accent color CSS custom properties
  const accentHex = settings.accentColor || '#6C63FF';
  const [r, g, b] = hexToRgb(accentHex);
  const glow = `rgba(${r}, ${g}, ${b}, 0.28)`;
  const subtle = `rgba(${r}, ${g}, ${b}, 0.12)`;
  const hoverColor = adjustBrightness(accentHex, -12);

  root.style.setProperty('--primary-accent', accentHex);
  root.style.setProperty('--accent-color', accentHex);
  root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  root.style.setProperty('--accent-glow', glow);
  root.style.setProperty('--accent-subtle', subtle);
  root.style.setProperty('--accent-hover', hoverColor);
  root.setAttribute('data-accent-color', accentHex);

  // 3. Interface density data attribute and class
  const density = settings.interfaceDensity || 'comfortable';
  root.setAttribute('data-density', density);
  body?.setAttribute('data-density', density);
  root.classList.toggle('density-compact', density === 'compact');
  root.classList.toggle('density-comfortable', density === 'comfortable');

  // 4. Motion settings
  root.setAttribute('data-motion-enabled', String(settings.motionEnabled ?? true));
  root.setAttribute('data-reduced-motion', String(settings.reducedMotion ?? false));

  // 5. Persistence
  try {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
    localStorage.setItem(THEME_STORAGE_KEY, settings.theme);
  } catch (err) {
    console.warn('Failed to save appearance settings to localStorage', err);
  }

  return darkEffective;
}

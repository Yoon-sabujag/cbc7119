/**
 * 테마 결정자 v0.1.0
 *
 * 결정 우선순위: localStorage → 시스템 환경 → 기본값 'dark'
 *
 * 사용:
 *   // main.tsx 진입 시 한 번
 *   import { initTheme } from './utils/theme';
 *   initTheme();
 *
 *   // 설정 패널에서 사용자가 모드 변경 시
 *   import { setThemePreference } from './utils/theme';
 *   setThemePreference('light');  // 또는 'dark', 'auto'
 */

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'auto';

const STORAGE_KEY = 'theme';

/**
 * 현재 적용해야 할 테마 결정.
 * localStorage > 시스템 > 기본 'dark' 순서.
 */
export function resolveTheme(): Theme {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;

  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  // 미지정 또는 'auto' → 시스템 따라가기
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * DOM에 테마 적용.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * 사용자 선호 저장 + 즉시 적용.
 * 'auto'를 넘기면 localStorage 제거 → 시스템 따라감.
 */
export function setThemePreference(pref: ThemePreference): void {
  if (pref === 'auto') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, pref);
  }
  applyTheme(resolveTheme());
}

/**
 * 현재 사용자 선호 조회 ('auto' 포함).
 * 설정 UI에서 라디오 버튼 초기값 등에 사용.
 */
export function getThemePreference(): ThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
  return saved === 'light' || saved === 'dark' ? saved : 'auto';
}

/**
 * 시스템 테마 변경 감지 (auto 모드일 때만 반영).
 * 반환값은 cleanup 함수 — useEffect cleanup 등에서 호출.
 */
export function watchSystemTheme(): () => void {
  const mq = matchMedia('(prefers-color-scheme: light)');
  const handler = () => {
    if (getThemePreference() === 'auto') {
      applyTheme(resolveTheme());
    }
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

/**
 * 앱 진입 시 호출. 테마 적용 + 시스템 변경 감시 시작.
 * 반환값은 cleanup 함수.
 */
export function initTheme(): () => void {
  applyTheme(resolveTheme());
  return watchSystemTheme();
}

export type Theme = 'dark' | 'light';

export const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('roadvision_theme') as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // default to dark
};

export const applyTheme = (theme: Theme) => {
  localStorage.setItem('roadvision_theme', theme);
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
  }
};

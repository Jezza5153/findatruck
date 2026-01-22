'use client';
import { useEffect, useState } from 'react';
import { IconMoon, IconSun } from '@/components/ui/branded-icons';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.theme;
    if (
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      theme === 'dark'
    ) {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  function toggle() {
    setDark((d) => {
      if (!d) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return !d;
    });
  }

  return (
    <button
      aria-label="Toggle dark mode"
      className="rounded-full border p-2 shadow hover:scale-110 transition"
      onClick={toggle}
    >
      {dark ? <IconSun className="text-yellow-400 w-5 h-5" /> : <IconMoon className="text-gray-700 w-5 h-5" />}
    </button>
  );
}

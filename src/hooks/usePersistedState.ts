import { useEffect, useState } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T | (() => T),
  isRawString = false
) {
  const [state, setState] = useState<T>(() => {
    const fallback =
      typeof defaultValue === 'function'
        ? (defaultValue as () => T)()
        : defaultValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return fallback;
      if (isRawString) return saved as unknown as T;
      return JSON.parse(saved) as T;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      if (isRawString) {
        localStorage.setItem(key, String(state));
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch {
      // Ignora erros de storage em modo privado
    }
  }, [key, state, isRawString]);

  return [state, setState] as const;
}

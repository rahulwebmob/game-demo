import { useState, useEffect, useRef } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const prevSerialized = useRef<string>("");

  useEffect(() => {
    try {
      const serialized = JSON.stringify(value);
      if (serialized !== prevSerialized.current) {
        prevSerialized.current = serialized;
        localStorage.setItem(key, serialized);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        console.warn("[Storage] Quota exceeded for key:", key);
      }
    }
  }, [key, value]);

  return [value, setValue];
}

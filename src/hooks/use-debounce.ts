import { useEffect, useState, useRef } from "react";

export function useDebounce<T>(value: T, delay?: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  const previousValueRef = useRef<string>(JSON.stringify(value));

  useEffect(() => {
    const currentValueJson = JSON.stringify(value);
    
    // Only trigger if the actual content changed
    if (currentValueJson !== previousValueRef.current) {
      setIsPending(true);
      const timer = setTimeout(() => {
        setDebouncedValue(value);
        setIsPending(false);
        previousValueRef.current = currentValueJson;
      }, delay || 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay]);

  return [debouncedValue, isPending] as const;
}

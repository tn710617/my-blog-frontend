import { useEffect } from 'react';

export default function useBodyScrollLock(active) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [active]);
}


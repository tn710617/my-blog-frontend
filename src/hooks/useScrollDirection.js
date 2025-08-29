import { useState, useEffect } from 'react';

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const toggleScrollDirection = () => {
      const scrollY = window.pageYOffset;
      
      if (Math.abs(scrollY - prevOffset) < 10) {
        return;
      }
      
      setScrollDirection(scrollY > prevOffset ? "down" : "up");
      setPrevOffset(scrollY);
    };

    window.addEventListener("scroll", toggleScrollDirection);

    return () => {
      window.removeEventListener("scroll", toggleScrollDirection);
    };
  }, [prevOffset]);

  return scrollDirection;
};

export default useScrollDirection;
import { useState, useEffect, useRef } from 'react';

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const [prevOffset, setPrevOffset] = useState(() => window.pageYOffset);
  const lastDirectionRef = useRef(null);

  useEffect(() => {
    const toggleScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const maxScroll = documentHeight - windowHeight;
      
      // Don't hide navbar when at the very top of the page
      if (scrollY <= 0) {
        setScrollDirection("up");
        setPrevOffset(scrollY);
        lastDirectionRef.current = "up";
        return;
      }
      
      // Ignore small scroll movements to prevent jittery behavior
      if (Math.abs(scrollY - prevOffset) < 10) {
        return;
      }
      
      const currentDirection = scrollY > prevOffset ? "down" : "up";
      
      // Special handling for mobile Safari bounce at bottom
      // If we're near the bottom and the direction is "up", check if it's likely a bounce
      if (currentDirection === "up" && scrollY >= maxScroll - 100) {
        // If the last direction was "down" and we're near bottom, it's likely a bounce
        // Keep the navbar hidden by maintaining "down" direction
        if (lastDirectionRef.current === "down") {
          setScrollDirection("down");
          setPrevOffset(scrollY);
          return;
        }
      }
      
      setScrollDirection(currentDirection);
      setPrevOffset(scrollY);
      lastDirectionRef.current = currentDirection;
    };

    window.addEventListener("scroll", toggleScrollDirection);

    return () => {
      window.removeEventListener("scroll", toggleScrollDirection);
    };
  }, [prevOffset]);

  return scrollDirection;
};

export default useScrollDirection;
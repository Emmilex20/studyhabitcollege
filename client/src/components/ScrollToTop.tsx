// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scrolls to the top of the page on route change with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Added smooth behavior here
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
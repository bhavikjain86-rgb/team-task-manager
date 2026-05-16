import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Basic scroll to top on navigation
    // In a more advanced version, we could store scroll per-route in sessionStorage
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

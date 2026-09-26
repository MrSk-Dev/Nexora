import { useState, useEffect } from 'react';
import SplashVisual from './SplashVisual';

const AppEntry = ({ children }) => {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('nexora_splash_shown'));

  useEffect(() => {
    if (!showSplash) return;
    sessionStorage.setItem('nexora_splash_shown', 'true');
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) {
    return <SplashVisual />;
  }

  return children;
};

export default AppEntry;
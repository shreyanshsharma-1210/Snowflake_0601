import { useState, useEffect } from 'react';

/**
 * Hook to calculate responsive scale factor for mobile devices
 * Maintains desktop layout but scales it down proportionally on smaller screens
 */
export function useResponsiveScale(breakpoint: number = 1024, minScale: number = 0.5) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (typeof window === 'undefined') return;
      
      const width = window.innerWidth;
      if (width < breakpoint) {
        // Scale down proportionally for mobile, but not below minScale
        const calculatedScale = width / breakpoint;
        setScale(Math.max(minScale, Math.min(1, calculatedScale)));
      } else {
        setScale(1);
      }
    };

    // Calculate on mount
    calculateScale();

    // Recalculate on resize
    window.addEventListener('resize', calculateScale);
    
    return () => window.removeEventListener('resize', calculateScale);
  }, [breakpoint, minScale]);

  return scale;
}

/**
 * Get scale transform styles for components
 */
export function getScaleStyles(scale: number) {
  if (scale >= 1) {
    return {}; // No transform needed for desktop
  }
  
  return {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: `${(100 / scale)}%`,
    height: 'auto',
  };
}

/**
 * Get responsive grid classes based on screen size
 */
export function getResponsiveGridClass(scale: number) {
  // On mobile (scaled), use 2x2 grid
  if (scale < 1) {
    return 'grid-cols-2';
  }
  // On desktop, use original layout
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
}

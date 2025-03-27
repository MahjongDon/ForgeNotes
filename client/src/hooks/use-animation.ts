import { useState, useEffect } from 'react';

interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  onComplete?: () => void;
}

// Custom hook for controlled animations
export function useAnimation(initialActive = false, options: AnimationOptions = {}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isVisible, setIsVisible] = useState(initialActive);

  const {
    duration = 300,
    delay = 0,
    easing = 'ease',
    onComplete
  } = options;

  // Handle animation entry
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isActive) {
      setIsVisible(true);
      // No need for a timeout when showing
    } else {
      // When hiding, keep element in DOM until animation completes
      timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration + delay);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isActive, duration, delay, onComplete]);

  // Animation style props
  const style = {
    transition: `all ${duration}ms ${easing} ${delay}ms`,
  };

  // Toggle animation state
  const toggle = () => setIsActive(!isActive);
  const activate = () => setIsActive(true);
  const deactivate = () => setIsActive(false);

  return {
    isActive,
    isVisible,
    style,
    toggle,
    activate,
    deactivate,
    setIsActive,
  };
}

// Hook for handling hover state animations
export function useHoverAnimation(options: AnimationOptions = {}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsHovered(true),
    onBlur: () => setIsHovered(false),
  };
  
  return {
    isHovered,
    setIsHovered,
    hoverProps,
    style: {
      transition: `all ${options.duration || 200}ms ${options.easing || 'ease'} ${options.delay || 0}ms`,
    },
  };
}

// Hook for ripple effect on click
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; }>>([]);
  
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const id = Date.now();
    
    setRipples([...ripples, { id, x, y }]);
    
    setTimeout(() => {
      setRipples(ripples => ripples.filter(ripple => ripple.id !== id));
    }, 600); // Duration of the ripple animation
  };
  
  return {
    ripples,
    createRipple,
    rippleClass: "overflow-hidden relative", // Apply this class to the container
  };
}

// Hook for smooth loading state
export function useLoadingAnimation(isLoading: boolean) {
  const [showLoader, setShowLoader] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (isLoading) {
      setShowLoader(true);
      setFadeOut(false);
    } else {
      setFadeOut(true);
      timer = setTimeout(() => {
        setShowLoader(false);
      }, 300); // fade out duration
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isLoading]);
  
  return {
    showLoader,
    fadeOut,
    loaderStyle: {
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 300ms ease',
    },
  };
}
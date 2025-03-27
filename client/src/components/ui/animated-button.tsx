import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRippleEffect, useHoverAnimation } from "@/hooks/use-animation";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
  rippleEffect?: boolean;
  hoverScale?: boolean;
  hoverScaleFactor?: number;
  pulseOnMount?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    rippleEffect = true, 
    hoverScale = false, 
    hoverScaleFactor = 1.03,
    pulseOnMount = false,
    className, 
    children, 
    onClick, 
    ...props 
  }, ref) => {
    // Ripple effect
    const { ripples, createRipple, rippleClass } = useRippleEffect();
    
    // Hover animation
    const { isHovered, hoverProps, style } = useHoverAnimation();
    
    // Pulse animation on mount
    const [hasPulsed, setHasPulsed] = React.useState(false);
    
    React.useEffect(() => {
      if (pulseOnMount && !hasPulsed) {
        setHasPulsed(true);
      }
    }, [pulseOnMount, hasPulsed]);
    
    // Combined style for transitions
    const combinedStyle = {
      ...style,
      transform: hoverScale && isHovered ? `scale(${hoverScaleFactor})` : 'scale(1)',
    };
    
    // Handle click with ripple
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (rippleEffect) {
        createRipple(e);
      }
      if (onClick) {
        onClick(e);
      }
    };
    
    return (
      <Button
        ref={ref}
        className={cn(
          rippleEffect && rippleClass,
          pulseOnMount && hasPulsed && "animate-pulse-once",
          className
        )}
        style={combinedStyle}
        onClick={handleClick}
        {...hoverProps}
        {...props}
      >
        {children}
        
        {rippleEffect && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 dark:bg-white/20 animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transformOrigin: 'center',
              width: '10px',
              height: '10px',
            }}
          />
        ))}
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
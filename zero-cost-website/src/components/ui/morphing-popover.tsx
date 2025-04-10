
'use client';

import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
  isValidElement,
} from 'react';
import {
  AnimatePresence,
  motion,
  Transition,
  Variants,
  HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/lib/utils';

const TRANSITION = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4,
};

type MorphingPopoverContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  uniqueId: string;
  variants?: Variants;
};

const MorphingPopoverContext = createContext<MorphingPopoverContextValue | null>(null);

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const uniqueId = useId();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isOpen = controlledOpen ?? uncontrolledOpen;

  const open = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
  };

  const close = () => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
  };

  return { isOpen, open, close, uniqueId };
}

export type MorphingPopoverProps = {
  children: React.ReactNode;
  transition?: Transition;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variants?: Variants;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "children" | "transition" | "variants">;

export type MorphingPopoverTriggerProps = {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"button">, "onClick">;

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps) {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange });

  return (
    <MorphingPopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <motion.div
        transition={transition}
        className={cn('relative flex items-center justify-center', className)}
        key={popoverLogic.uniqueId}
        {...props}
      >
        {children}
      </motion.div>
    </MorphingPopoverContext.Provider>
  );
}

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) {
    throw new Error('MorphingPopoverTrigger must be used within MorphingPopover');
  }

  // Direct click handler that will trigger the open function
  const handleClick = () => {
    console.log("Trigger clicked, opening popup");
    context.open();
  };

  if (asChild && isValidElement(children)) {
    const MotionComponent = motion(children.type as React.ForwardRefExoticComponent<any>);
    const childProps = children.props as Record<string, unknown>;

    return (
      <MotionComponent
        {...childProps}
        onClick={handleClick}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={childProps.className}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    );
  }

  return (
    <motion.button
      {...props}
      onClick={handleClick}
      layoutId={`popover-trigger-${context.uniqueId}`}
      className={className}
      aria-expanded={context.isOpen}
      aria-controls={`popover-content-${context.uniqueId}`}
    >
      {children}
    </motion.button>
  );
}

export type MorphingPopoverContentProps = {
  children: React.ReactNode;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "variants">;

function MorphingPopoverContent({
  children,
  className,
  ...props
}: MorphingPopoverContentProps) {
  const context = useContext(MorphingPopoverContext);
  if (!context) throw new Error('MorphingPopoverContent must be used within MorphingPopover');

  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!context.isOpen || !ref.current) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context]);

  useEffect(() => {
    if (!context.isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.close();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [context.isOpen, context]);

  return (
    <AnimatePresence>
      {context.isOpen && (
        <>
          <motion.div
            {...props}
            ref={ref}
            layoutId={`popover-trigger-${context.uniqueId}`}
            key={context.uniqueId}
            id={`popover-content-${context.uniqueId}`}
            role='dialog'
            aria-modal='true'
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center',
              className
            )}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={context.variants || {
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.95 }
            }}
            onClick={(e) => {
              // Prevent clicks inside the popup from propagating to the overlay
              e.stopPropagation();
            }}
          >
            {children}
          </motion.div>
          <motion.div 
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => context.close()}
          />
        </>
      )}
    </AnimatePresence>
  );
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent };

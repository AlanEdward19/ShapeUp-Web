import { motion, useReducedMotion } from 'motion/react';
import type { ReactElement, ReactNode } from 'react';

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function FadeUp({ children, className, delay = 0 }: FadeUpProps): ReactElement {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

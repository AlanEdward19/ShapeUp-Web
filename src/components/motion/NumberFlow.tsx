import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ReactElement } from 'react';

type NumberFlowProps = {
  value: string | number;
  className?: string;
};

export default function NumberFlow({ value, className }: NumberFlowProps): ReactElement {
  const reduceMotion = useReducedMotion();
  const key = String(value);
  if (reduceMotion) {
    return <span className={className}>{key}</span>;
  }
  return (
    <span className={className} style={{ display: 'inline-block', position: 'relative' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'inline-block' }}
        >
          {key}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

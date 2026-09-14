import type { ChangeEvent, ReactNode } from 'react';

declare const DatePicker: (props: {
  'aria-label'?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  iconOnly?: boolean;
  id?: string;
  max?: string;
  min?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  style?: Record<string, unknown>;
  value?: string;
  [key: string]: unknown;
}) => ReactNode;

export default DatePicker;

import { View, type ViewProps } from 'react-native';

import { cn } from './cn';

export function Card({ className, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm',
        className,
      )}
      {...rest}
    />
  );
}

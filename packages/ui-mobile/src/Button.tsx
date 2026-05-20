import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { cn } from './cn';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const BASE = 'flex-row items-center justify-center rounded-xl';

const VARIANTS: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-rose-600 active:bg-rose-700', text: 'text-white' },
  secondary: { container: 'bg-zinc-800 active:bg-zinc-700', text: 'text-zinc-100' },
  destructive: { container: 'bg-red-600 active:bg-red-700', text: 'text-white' },
  ghost: { container: 'bg-transparent active:bg-zinc-800/40', text: 'text-zinc-100' },
  outline: { container: 'border border-zinc-700 active:bg-zinc-800', text: 'text-zinc-100' },
};

const SIZES: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-4 py-2', text: 'text-sm font-medium' },
  md: { container: 'px-5 py-3', text: 'text-base font-semibold' },
  lg: { container: 'px-6 py-4', text: 'text-lg font-semibold' },
};

export function Button({ label, variant = 'primary', size = 'md', loading, disabled, ...rest }: Props) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading || disabled}
      className={cn(BASE, v.container, s.container, (loading || disabled) && 'opacity-60')}
      {...rest}
    >
      {loading ? <ActivityIndicator color="#fff" className="mr-2" /> : null}
      <Text className={cn(v.text, s.text)}>{label}</Text>
    </Pressable>
  );
}

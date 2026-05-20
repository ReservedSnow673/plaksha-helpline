import type { DepartmentCode } from '@plaksha/shared-types';
import { Text, View } from 'react-native';

const GLYPH: Record<DepartmentCode, string> = {
  MEDICAL: 'M',
  FIRE: 'F',
  SECURITY: 'S',
  WOMEN_SAFETY: 'W',
  MENTAL_HEALTH: 'P',
  MAINTENANCE: 'X',
  ELECTRICAL: 'E',
  CARPENTRY: 'C',
  FACILITIES: 'B',
  ESCORT: 'V',
  ADMIN_ESCALATION: 'A',
};

const COLOR: Record<DepartmentCode, string> = {
  MEDICAL: 'bg-rose-600',
  FIRE: 'bg-orange-600',
  SECURITY: 'bg-blue-600',
  WOMEN_SAFETY: 'bg-pink-600',
  MENTAL_HEALTH: 'bg-violet-600',
  MAINTENANCE: 'bg-amber-600',
  ELECTRICAL: 'bg-yellow-600',
  CARPENTRY: 'bg-amber-700',
  FACILITIES: 'bg-zinc-600',
  ESCORT: 'bg-cyan-600',
  ADMIN_ESCALATION: 'bg-slate-600',
};

export function CategoryIcon({ category, size = 40 }: { category: DepartmentCode; size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center ${COLOR[category]}`}
    >
      <Text style={{ fontSize: size * 0.5 }} className="font-black text-white">
        {GLYPH[category]}
      </Text>
    </View>
  );
}

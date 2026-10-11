import type { Risk } from '../../types/api'
const tone: Record<Risk, string> = { LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-600/20', HIGH: 'bg-red-50 text-red-700 ring-red-600/20' }
export const RiskBadge = ({ risk }: { risk: Risk }) => (
  <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone[risk]}`}>{risk}</span>)

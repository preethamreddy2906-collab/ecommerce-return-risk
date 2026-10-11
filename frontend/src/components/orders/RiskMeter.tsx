import type { Risk } from '../../types/api'
const bar: Record<Risk, string> = { LOW: 'bg-emerald-500', MEDIUM: 'bg-amber-500', HIGH: 'bg-red-500' }
export function RiskMeter({ probability, risk }: { probability: number; risk: Risk }) {
  return (<div><div className="flex items-baseline justify-between"><span className="text-2xl font-semibold tabular-nums">{(probability * 100).toFixed(1)}%</span><span className="text-sm font-medium">{risk}</span></div>
    <div className="mt-2 h-1.5 rounded bg-slate-200" role="progressbar" aria-valuenow={Math.round(probability * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Return probability">
      <div className={`h-1.5 rounded ${bar[risk]}`} style={{ width: `${probability * 100}%` }} /></div></div>)
}

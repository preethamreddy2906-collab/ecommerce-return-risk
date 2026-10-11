import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { Kpi } from '../../types/api'
export function KpiCard({ k }: { k: Kpi }) {
  const good = k.invertGood ? k.change < 0 : k.change > 0
  const Icon = k.change >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{k.label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{k.value}</p>
      <p className={`mt-1 flex items-center gap-1 text-sm ${good ? 'text-emerald-600' : 'text-red-600'}`}>
        <Icon size={14} aria-hidden />{Math.abs(k.change)}% <span className="text-slate-400">vs previous</span></p>
    </div>)
}
export const KpiSkeleton = () => <div className="h-[104px] animate-pulse rounded-lg border border-slate-200 bg-white" />

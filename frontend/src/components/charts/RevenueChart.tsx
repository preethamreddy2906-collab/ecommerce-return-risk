import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TimePoint } from '../../types/api'
const metrics = [['revenue', 'Revenue'], ['orders', 'Orders'], ['profit', 'Gross profit']] as const
export function RevenueChart({ data }: { data: TimePoint[] }) {
  const [m, setM] = useState<'revenue' | 'orders' | 'profit'>('revenue')
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Revenue overview</h2>
        <div role="tablist" className="flex rounded-md border border-slate-200 p-0.5 text-sm">
          {metrics.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={m === k} onClick={() => setM(k)}
              className={`rounded px-3 py-1 ${m === k ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{l}</button>))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip />
            <Area type="monotone" dataKey={m} stroke="#4338ca" fill="#eef2ff" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>)
}

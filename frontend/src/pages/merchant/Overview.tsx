import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getDashboardAnalytics } from '../../api/client'
import { useAsync } from '../../hooks'
import { KpiCard, KpiSkeleton } from '../../components/ui/KpiCard'
import { RiskBadge } from '../../components/ui/Badge'
import { RevenueChart } from '../../components/charts/RevenueChart'
const inr = (n: number) => '$' + n.toLocaleString('en-IN')
const ranges = ['Today', 'Last 7 days', 'Last 30 days', 'Custom']
export default function Overview() {
  const [range, setRange] = useState('Last 30 days')
  const { data, loading, error } = useAsync(getDashboardAnalytics)
  const attention = data?.products.filter(p => p.risk !== 'LOW').sort((a, b) => b.potentialLoss - a.potentialLoss).slice(0, 3) ?? []
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Good morning, Merchant</h1><p className="text-slate-500">Here's what's happening with your store.</p></div>
        <select aria-label="Date range" value={range} onChange={e => setRange(e.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm">
          {ranges.map(r => <option key={r}>{r}</option>)}</select>
      </div>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">Couldn't load analytics: {error}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {loading ? Array.from({ length: 5 }, (_, i) => <KpiSkeleton key={i} />) : data?.kpis.map(k => <KpiCard key={k.key} k={k} />)}</div>
      {data && <>
        <RevenueChart data={data.series} />
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2">
            <h2 className="mb-3 font-semibold">Return intelligence</h2>
            <div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.series}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} /><XAxis dataKey="date" interval={4} tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} /><Line dataKey="returnRate" stroke="#dc2626" strokeWidth={2} dot={false} name="Return rate" /></LineChart></ResponsiveContainer></div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-semibold">Products requiring attention</h2>
            <ul className="space-y-3">{attention.map(p => (
              <li key={p.id} className="text-sm"><div className="flex justify-between"><span className="font-medium">{p.name}</span><RiskBadge risk={p.risk} /></div>
                <p className="text-slate-500">{(p.returnProbability * 100).toFixed(1)}% return probability · {(p.returnRate * 100).toFixed(1)}% return rate</p>
                <p className="text-slate-500">{inr(p.revenue)} revenue · <span className="text-red-600">{inr(p.potentialLoss)} potential loss</span></p></li>))}</ul>
          </section>
        </div>
        <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between p-4"><h2 className="font-semibold">Top products</h2><Link to="/merchant/products" className="text-sm text-brand-600 hover:underline">View all products</Link></div>
          <table className="w-full text-left text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-slate-500"><tr>
            {['Product', 'Category', 'Revenue', 'Orders', 'Return rate', 'Gross profit', 'Risk'].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
            <tbody>{data.products.map(p => (<tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-2 font-medium">{p.name}</td><td className="px-4 py-2">{p.category}</td><td className="px-4 py-2 tabular-nums">{inr(p.revenue)}</td>
              <td className="px-4 py-2 tabular-nums">{p.orders}</td><td className="px-4 py-2 tabular-nums">{(p.returnRate * 100).toFixed(1)}%</td>
              <td className="px-4 py-2 tabular-nums">{inr(p.profit)}</td><td className="px-4 py-2"><RiskBadge risk={p.risk} /></td></tr>))}</tbody></table>
        </section></>}
    </div>)
}

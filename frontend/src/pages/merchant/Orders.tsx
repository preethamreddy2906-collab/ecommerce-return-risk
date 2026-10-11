import { useMemo, useState } from 'react'
import { getOrders } from '../../api/client'
import { useAsync } from '../../hooks'
import { useCart } from '../../context/CartContext'
import { RiskBadge } from '../../components/ui/Badge'
import { OrderDrawer } from '../../components/orders/OrderDrawer'
import type { MerchantOrder, OrderStatus, Risk } from '../../types/api'
import { inr } from '../../utils'
const PAGE = 8
export default function Orders() {
  const { data, loading, error } = useAsync(getOrders); const { orders: placed } = useCart()
  const [status, setStatus] = useState('All'); const [risk, setRisk] = useState('All'); const [sortDesc, setSortDesc] = useState(true); const [page, setPage] = useState(0); const [open, setOpen] = useState<MerchantOrder | null>(null)
  // Orders placed on the storefront this session appear immediately (until the backend is connected).
  const rows = useMemo(() => {
    const fresh: MerchantOrder[] = placed.map(p => ({ id: p.id, customer: 'New customer', email: 'u1@example.com', date: p.placedAt, status: 'Processing' as OrderStatus, risk: 'MEDIUM' as Risk, returnProbability: null,
      items: p.lines.map(l => ({ name: l.product.name, quantity: l.quantity, price: l.product.price })), revenue: p.total, customerReturnRate: 0, customerOrders: 1 }))
    return [...fresh, ...(data ?? [])].filter(o => (status === 'All' || o.status === status) && (risk === 'All' || o.risk === risk))
      .sort((a, b) => (sortDesc ? 1 : -1) * (+new Date(b.date) - +new Date(a.date)))
  }, [data, placed, status, risk, sortDesc])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE)); const view = rows.slice(page * PAGE, page * PAGE + PAGE)
  const sel = 'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm'
  return (<div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Orders</h1><p className="text-slate-500">Select an order to see its return-risk prediction.</p></div>
      <div className="flex gap-2"><select aria-label="Status" value={status} onChange={e => { setStatus(e.target.value); setPage(0) }} className={sel}>{['All', 'Processing', 'Shipped', 'Delivered', 'Returned', 'Cancelled'].map(s => <option key={s}>{s}</option>)}</select>
        <select aria-label="Return risk" value={risk} onChange={e => { setRisk(e.target.value); setPage(0) }} className={sel}>{['All', 'LOW', 'MEDIUM', 'HIGH'].map(s => <option key={s}>{s}</option>)}</select></div></div>
    {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">Couldn't load orders: {error}</p>}
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white"><table className="w-full text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr>{['Order ID', 'Customer', 'Date', 'Items', 'Revenue', 'Status', 'Return risk'].map(h => <th key={h} className="px-4 py-2 font-medium">
        {h === 'Date' ? <button onClick={() => setSortDesc(d => !d)} aria-label="Sort by date">Date {sortDesc ? '↓' : '↑'}</button> : h}</th>)}<th className="px-4 py-2"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{loading ? [0, 1, 2, 3].map(i => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-slate-100" /></td></tr>)
        : view.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No orders match these filters.</td></tr>
        : view.map(o => <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50"><td className="px-4 py-2 font-medium">{o.id}</td><td className="px-4 py-2">{o.customer}</td>
          <td className="px-4 py-2">{new Date(o.date).toLocaleDateString('en-IN')}</td><td className="px-4 py-2">{o.items.reduce((s, i) => s + i.quantity, 0)}</td><td className="px-4 py-2 tabular-nums">{inr(o.revenue)}</td>
          <td className="px-4 py-2">{o.status}</td><td className="px-4 py-2"><RiskBadge risk={o.risk} /></td>
          <td className="px-4 py-2 text-right"><button onClick={() => setOpen(o)} className="text-brand-600 hover:underline">View</button></td></tr>)}</tbody></table></div>
    <div className="flex items-center justify-end gap-3 text-sm"><span className="text-slate-500">Page {page + 1} of {pages}</span>
      <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Previous</button>
      <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button></div>
    {open && <OrderDrawer order={open} onClose={() => setOpen(null)} />}
  </div>)
}

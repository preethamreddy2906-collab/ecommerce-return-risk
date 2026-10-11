import { useEffect } from 'react'
import { useToast } from '../../context/ToastContext'
import { X } from 'lucide-react'
import { predictReturnRisk } from '../../api/client'
import { useAsync } from '../../hooks'
import type { MerchantOrder } from '../../types/api'
import { RiskMeter } from './RiskMeter'
import { inr } from '../../utils'
const steps = ['Order placed', 'Processing', 'Shipped', 'Delivered']
export function OrderDrawer({ order, onClose }: { order: MerchantOrder; onClose: () => void }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  const toast = useToast(); const pred = useAsync(() => predictReturnRisk(order.id), [order.id])
  useEffect(() => { if (pred.data) toast('success', 'Prediction completed'); if (pred.error) toast('error', 'Prediction failed') }, [pred.data, pred.error]) // eslint-disable-line
  const reached = Math.max(0, steps.indexOf(order.status === 'Returned' ? 'Delivered' : order.status))
  const risk = pred.data
  return (<div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" onClick={onClose}>
    <aside role="dialog" aria-modal="true" aria-label={`Order ${order.id}`} onClick={e => e.stopPropagation()} className="h-full w-full max-w-md space-y-5 overflow-y-auto bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">{order.id}</h2><p className="text-sm text-slate-500">{new Date(order.date).toLocaleDateString('en-IN')} · {order.status}</p></div>
        <button aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>
      <section><h3 className="mb-2 text-sm font-semibold">Return risk</h3>
        {pred.loading ? <div className="h-14 animate-pulse rounded bg-slate-100" /> : pred.error || !risk ? <p role="alert" className="text-sm text-red-700">Prediction unavailable: {pred.error}</p> : <RiskMeter probability={risk.probability} risk={risk.risk} />}</section>
      <section><h3 className="mb-2 text-sm font-semibold">Customer</h3><p className="text-sm">{order.customer} · {order.email}</p>
        <p className="text-sm text-slate-500">{order.customerOrders} orders · {(order.customerReturnRate * 100).toFixed(0)}% return rate</p></section>
      <section><h3 className="mb-2 text-sm font-semibold">Products</h3><ul className="divide-y divide-slate-100 text-sm">{order.items.map(i => <li key={i.name} className="flex justify-between py-1.5"><span>{i.name} ×{i.quantity}</span><span className="tabular-nums">{inr(i.price * i.quantity)}</span></li>)}
        <li className="flex justify-between py-1.5 font-semibold"><span>Order value</span><span>{inr(order.revenue)}</span></li></ul></section>
      <section><h3 className="mb-2 text-sm font-semibold">Timeline</h3><ol className="space-y-2 text-sm">{steps.map((s, i) => <li key={s} className={`flex items-center gap-2 ${i <= reached ? '' : 'text-slate-400'}`}>
        <span className={`h-2 w-2 rounded-full ${i <= reached ? 'bg-brand-600' : 'bg-slate-300'}`} />{s}</li>)}{order.status === 'Returned' && <li className="flex items-center gap-2 text-red-700"><span className="h-2 w-2 rounded-full bg-red-500" />Returned</li>}</ol></section>
    </aside></div>)
}

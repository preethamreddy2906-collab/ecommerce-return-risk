import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { createOrder } from '../../api/client'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import type { PlacedOrder } from '../../types/api'
import { inr } from '../../utils'
export default function Cart() {
  const { lines, subtotal, setQty, clear, record } = useCart(); const toast = useToast()
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [done, setDone] = useState<PlacedOrder | null>(null)
  const delivery = subtotal > 999 ? 0 : 79; const total = subtotal + delivery
  async function place() {
    setBusy(true); setErr('')
    try {
      const o = await createOrder({ customerId: 'u1', total, items: lines.map(l => ({ productId: l.product.id, quantity: l.quantity })) })
      const placed = { ...o, total: o.total || total, placedAt: new Date().toISOString(), lines }; record(placed); setDone(placed); clear(); toast('success', `Order ${o.id} created`)
    } catch (e) { setErr(`Order failed: ${(e as Error).message}. Your cart is unchanged; try again.`); toast('error', 'Order failed') } finally { setBusy(false) }
  }
  if (done) return (<div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
    <CheckCircle2 className="mx-auto text-emerald-600" size={40} /><h1 className="mt-3 text-xl font-semibold">Order placed successfully</h1>
    <dl className="mt-4 space-y-1 text-sm">{[['Order ID', done.id], ['Total', inr(done.total)], ['Status', done.status], ['Estimated delivery', done.estimatedDelivery]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
    <div className="mt-6 flex justify-center gap-3 text-sm"><Link to="/orders" className="rounded-md border border-slate-300 px-4 py-2">My orders</Link><Link to="/shop" className="rounded-md bg-brand-600 px-4 py-2 text-white">Keep shopping</Link></div></div>)
  if (!lines.length) return <p className="py-12 text-center text-slate-500">Your cart is empty. <Link to="/shop" className="text-brand-600 underline">Browse products</Link></p>
  return (<div className="grid gap-6 lg:grid-cols-3"><section className="space-y-3 lg:col-span-2"><h1 className="text-2xl font-semibold">Cart</h1>
    {lines.map(({ product: p, quantity }) => (<div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div><p className="font-medium">{p.name}</p><p className="text-sm text-slate-500">{inr(p.price)} each</p></div>
      <div className="flex items-center gap-4"><input aria-label={`Quantity for ${p.name}`} type="number" min={0} value={quantity} onChange={e => setQty(p.id, +e.target.value)} className="w-16 rounded-md border border-slate-300 px-2 py-1" />
        <span className="w-24 text-right font-medium">{inr(p.price * quantity)}</span></div></div>))}</section>
    <aside className="h-fit space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
      {[['Subtotal', inr(subtotal)], ['Delivery', delivery ? inr(delivery) : 'Free'], ['Estimated delivery', '3–5 days']].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span>{v}</span></div>)}
      <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold"><span>Total</span><span>{inr(total)}</span></div>
      {err && <p role="alert" className="text-red-700">{err}</p>}
      <button onClick={place} disabled={busy} className="mt-2 w-full rounded-md bg-brand-600 py-2 text-white hover:bg-brand-700 disabled:opacity-60">{busy ? 'Placing order…' : 'Place order'}</button></aside></div>)
}

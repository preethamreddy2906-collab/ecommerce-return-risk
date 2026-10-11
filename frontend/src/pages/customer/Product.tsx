import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProducts } from '../../api/client'
import { useAsync } from '../../hooks'
import { useCart } from '../../context/CartContext'
import { ProductImage } from '../../components/products/ProductImage'
import { inr } from '../../utils'
export default function ProductPage() {
  const { id } = useParams(); const nav = useNavigate(); const { add } = useCart(); const [qty, setQty] = useState(1)
  const { data, loading } = useAsync(getProducts); const p = data?.find(x => x.id === id)
  if (loading) return <div className="h-80 animate-pulse rounded-lg bg-white" />
  if (!p) return <p className="py-12 text-center">Product not found. <Link to="/shop" className="text-brand-600 underline">Back to shop</Link></p>
  const stat = [['Return rate', `${(p.returnRate * 100).toFixed(1)}%`], ['Popularity', `${p.popularity}/100`], ['Availability', p.stock > 20 ? 'In stock' : `Only ${p.stock} left`]]
  return (<div className="grid gap-8 md:grid-cols-2">
    <ProductImage name={p.name} id={p.id} large />
    <div className="space-y-4"><p className="text-sm text-slate-500">{p.brand} · {p.category}</p><h1 className="text-2xl font-semibold">{p.name}</h1>
      <p className="text-2xl font-semibold">{inr(p.price)}</p><p className="text-slate-600">{p.description}</p>
      <div className="flex items-center gap-2"><label htmlFor="qty" className="text-sm">Quantity</label>
        <input id="qty" type="number" min={1} max={p.stock} value={qty} onChange={e => setQty(Math.max(1, +e.target.value || 1))} className="w-20 rounded-md border border-slate-300 px-2 py-1" /></div>
      <div className="flex gap-3"><button onClick={() => add(p, qty)} className="rounded-md border border-brand-600 px-5 py-2 text-brand-600 hover:bg-brand-50">Add to cart</button>
        <button onClick={() => { add(p, qty); nav('/cart') }} className="rounded-md bg-brand-600 px-5 py-2 text-white hover:bg-brand-700">Buy now</button></div>
      <section className="rounded-lg border border-slate-200 bg-white p-4"><h2 className="mb-2 font-semibold">Product insights</h2>
        <dl className="grid grid-cols-3 gap-3 text-sm">{stat.map(([k, v]) => <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></section>
    </div></div>)
}

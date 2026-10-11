import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { getProducts } from '../../api/client'
import { useAsync } from '../../hooks'
import { useCart } from '../../context/CartContext'
import { ProductImage } from '../../components/products/ProductImage'
import { inr } from '../../utils'
export default function Shop() {
  const { data, loading, error } = useAsync(getProducts); const { add } = useCart()
  const [q, setQ] = useState(''); const [cat, setCat] = useState('All'); const [max, setMax] = useState(15000); const [sort, setSort] = useState('popular')
  const cats = ['All', ...Array.from(new Set(data?.map(p => p.category) ?? []))]
  const list = useMemo(() => (data ?? []).filter(p => (cat === 'All' || p.category === cat) && p.price <= max && `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.popularity - a.popularity), [data, q, cat, max, sort])
  const field = 'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm'
  return (<div className="space-y-6">
    <section className="rounded-lg bg-navy-900 p-8 text-white"><h1 className="text-3xl font-semibold">Shop smarter. Discover better products.</h1><p className="mt-1 text-slate-300">Curated picks across footwear, apparel and electronics.</p></section>
    <div className="flex flex-wrap gap-3">
      <input aria-label="Search products" placeholder="Search products" value={q} onChange={e => setQ(e.target.value)} className={`${field} w-64`} />
      <select aria-label="Category" value={cat} onChange={e => setCat(e.target.value)} className={field}>{cats.map(c => <option key={c}>{c}</option>)}</select>
      <select aria-label="Maximum price" value={max} onChange={e => setMax(+e.target.value)} className={field}>{[2000, 5000, 15000].map(v => <option key={v} value={v}>Up to {inr(v)}</option>)}</select>
      <select aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)} className={field}><option value="popular">Most popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    {error && <p role="alert" className="text-red-700">Couldn't load products: {error}</p>}
    {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <div key={i} className="h-64 animate-pulse rounded-lg bg-white" />)}</div>
      : list.length === 0 ? <p className="py-12 text-center text-slate-500">No products match these filters. Try a higher price limit or clear the search.</p>
      : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(p => (
        <article key={p.id} className="rounded-lg border border-slate-200 bg-white">
          <Link to={`/product/${p.id}`}><ProductImage name={p.name} id={p.id} /></Link>
          <div className="space-y-1 p-4"><p className="text-xs text-slate-500">{p.brand} · {p.category}</p>
            <Link to={`/product/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
            <div className="flex items-center justify-between"><span className="font-semibold">{inr(p.price)}</span><span className="flex items-center gap-1 text-sm text-slate-500"><Star size={14} className="fill-amber-400 text-amber-400" />{p.rating}</span></div>
            <button onClick={() => add(p)} className="mt-2 w-full rounded-md bg-brand-600 py-2 text-sm text-white hover:bg-brand-700">Add to cart</button></div></article>))}</div>}
  </div>)
}

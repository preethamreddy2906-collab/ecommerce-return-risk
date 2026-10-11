import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { inr } from '../../utils'
export default function Orders() {
  const { orders } = useCart()
  if (!orders.length) return <p className="py-12 text-center text-slate-500">You haven't placed any orders yet. <Link to="/shop" className="text-brand-600 underline">Start shopping</Link></p>
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">My orders</h1><div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-slate-500"><tr>{['Order ID', 'Date', 'Items', 'Amount', 'Status'].map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
      <tbody>{orders.map(o => <tr key={o.id} className="border-b border-slate-100"><td className="px-4 py-2 font-medium">{o.id}</td><td className="px-4 py-2">{new Date(o.placedAt).toLocaleDateString('en-IN')}</td>
        <td className="px-4 py-2">{o.lines.map(l => `${l.product.name} ×${l.quantity}`).join(', ')}</td><td className="px-4 py-2 tabular-nums">{inr(o.total)}</td><td className="px-4 py-2">{o.status}</td></tr>)}</tbody></table></div></div>)
}

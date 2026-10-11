import { Link, Outlet } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
export default function CustomerLayout() {
  const { count } = useCart()
  return (<div className="min-h-screen">
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Link to="/shop" className="font-semibold text-brand-600">MerchantIQ Store</Link>
      <nav className="flex items-center gap-5 text-sm"><Link to="/orders" className="hover:underline">My orders</Link>
        <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative"><ShoppingCart size={18} />{count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-brand-600 px-1.5 text-xs text-white">{count}</span>}</Link>
        <Link to="/merchant" className="text-slate-500 hover:underline">Merchant view</Link></nav>
    </header><main className="mx-auto max-w-6xl p-6"><Outlet /></main></div>)
}

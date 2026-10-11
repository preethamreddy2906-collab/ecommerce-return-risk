import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, FileText, Menu, Package, ReceiptText, Settings, Sparkles, Users } from 'lucide-react'
const nav = [['/merchant', 'Overview', BarChart3], ['/merchant/orders', 'Orders', ReceiptText], ['/merchant/products', 'Products', Package],
  ['/merchant/customers', 'Customers', Users], ['/merchant/reports', 'Reports', FileText], ['/merchant/ai-analyst', 'AI Analyst', Sparkles]] as const
export default function MerchantLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen lg:pl-60">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-navy-900 text-slate-300 transition-transform lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
        <div className="px-5 py-5"><p className="text-lg font-semibold text-white">MerchantIQ</p><p className="text-xs text-slate-400">AI-powered intelligence for modern e-commerce.</p></div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === '/merchant'} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-navy-700 text-white' : 'hover:bg-navy-800'}`}>
              <Icon size={16} aria-hidden />{label}</NavLink>))}
        </nav>
        <div className="border-t border-navy-700 p-3 text-sm">
          <NavLink to="/merchant" className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-navy-800"><Settings size={16} />Settings</NavLink>
          <p className="px-3 pt-2 text-xs text-slate-400">Merchant · Admin</p>
        </div>
      </aside>
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button aria-label="Open menu" onClick={() => setOpen(o => !o)}><Menu size={20} /></button><span className="font-semibold">MerchantIQ</span></header>
      <main className="mx-auto max-w-7xl p-4 lg:p-8"><Outlet /></main>
    </div>)
}

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CartLine, PlacedOrder, Product } from '../types/api'
interface Ctx { lines: CartLine[]; count: number; subtotal: number; add: (p: Product, q?: number) => void; setQty: (id: string, q: number) => void; clear: () => void; orders: PlacedOrder[]; record: (o: PlacedOrder) => void }
const C = createContext<Ctx | null>(null)
export const useCart = () => { const c = useContext(C); if (!c) throw new Error('CartProvider missing'); return c }
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [orders, setOrders] = useState<PlacedOrder[]>([])
  const v = useMemo<Ctx>(() => ({
    lines, orders, count: lines.reduce((s, l) => s + l.quantity, 0), subtotal: lines.reduce((s, l) => s + l.quantity * l.product.price, 0),
    add: (p, q = 1) => setLines(ls => ls.some(l => l.product.id === p.id) ? ls.map(l => l.product.id === p.id ? { ...l, quantity: l.quantity + q } : l) : [...ls, { product: p, quantity: q }]),
    setQty: (id, q) => setLines(ls => q <= 0 ? ls.filter(l => l.product.id !== id) : ls.map(l => l.product.id === id ? { ...l, quantity: q } : l)),
    clear: () => setLines([]), record: o => setOrders(os => [o, ...os]),
  }), [lines, orders])
  return <C.Provider value={v}>{children}</C.Provider>
}

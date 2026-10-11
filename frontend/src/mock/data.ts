import type { AgentResponse, DashboardAnalytics, ProductStat, Risk } from '../types/api'
const r = (p: number): Risk => (p >= 0.6 ? 'HIGH' : p >= 0.35 ? 'MEDIUM' : 'LOW')
const raw: [string, string, number, number, number, number, number][] = [
  ['Nike Air Max 270', 'Footwear', 82400, 164, 0.182, 0.734, 12400],
  ['Levi’s 511 Slim Jeans', 'Apparel', 61800, 212, 0.141, 0.58, 7900],
  ['boAt Rockerz 450', 'Electronics', 54300, 301, 0.067, 0.29, 2100],
  ['Puma Running Shorts', 'Apparel', 33900, 188, 0.159, 0.64, 5200],
  ['Fastrack Analog Watch', 'Accessories', 29600, 97, 0.052, 0.22, 900],
]
const products: ProductStat[] = raw.map(([name, category, revenue, orders, returnRate, p, potentialLoss], i) => ({
  id: `p${i + 1}`, name, category, revenue, orders, returnRate, profit: Math.round(revenue * 0.31), risk: r(p), returnProbability: p, potentialLoss }))
const series = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 8, 1 + i)
  const base = 14000 + Math.sin(i / 3) * 3000 + i * 150
  return { date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), revenue: Math.round(base), orders: Math.round(base / 1700),
    profit: Math.round(base * 0.31), returnRate: +(0.09 + Math.cos(i / 4) * 0.015 + i * 0.0004).toFixed(3) }
})
export const mockDashboard: DashboardAnalytics = {
  products, series,
  kpis: [
    { key: 'revenue', label: 'Total revenue', value: '$4.82L', change: 12.4 },
    { key: 'orders', label: 'Total orders', value: '2,841', change: 8.1 },
    { key: 'returns', label: 'Return rate', value: '11.6%', change: 1.3, invertGood: true },
    { key: 'profit', label: 'Gross profit', value: '$1.49L', change: 9.7 },
    { key: 'risk', label: 'High-risk orders', value: '64', change: 5.2, invertGood: true },
  ],
}
export const mockAgent = (question: string): AgentResponse => ({
  question,
  sql: `SELECT p.name, SUM(oi.price * oi.quantity) AS revenue,\n       SUM(CASE WHEN o.status = 'Returned' THEN oi.price * oi.quantity ELSE 0 END) AS returned_value\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.name\nORDER BY returned_value DESC\nLIMIT 5;`,
  result: products.slice(0, 4).map(p => ({ product: p.name, revenue: p.revenue, estimated_loss: p.potentialLoss })),
  answer: 'Nike Air Max 270 is your largest source of loss at $12,400, driven by an 18.2% return rate. Footwear and apparel account for most of the exposure; size-related returns are the likely cause.',
})

import type { Product } from '../types/api'
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Nike Air Max 270', brand: 'Nike', category: 'Footwear', price: 12995, rating: 4.4, description: 'Cushioned everyday sneaker with a large heel Air unit and breathable mesh upper.', returnRate: 0.182, popularity: 88, stock: 42 },
  { id: 'p2', name: 'Levi’s 511 Slim Jeans', brand: 'Levi’s', category: 'Apparel', price: 3299, rating: 4.2, description: 'Slim-fit stretch denim that sits below the waist and tapers at the leg.', returnRate: 0.141, popularity: 81, stock: 120 },
  { id: 'p3', name: 'boAt Rockerz 450', brand: 'boAt', category: 'Electronics', price: 1499, rating: 4.1, description: 'Wireless on-ear headphones with 15-hour battery life and padded ear cushions.', returnRate: 0.067, popularity: 95, stock: 310 },
  { id: 'p4', name: 'Puma Running Shorts', brand: 'Puma', category: 'Apparel', price: 1799, rating: 4.0, description: 'Lightweight dryCELL shorts with an elastic waistband and side pockets.', returnRate: 0.159, popularity: 64, stock: 76 },
  { id: 'p5', name: 'Fastrack Analog Watch', brand: 'Fastrack', category: 'Accessories', price: 2195, rating: 4.3, description: 'Minimal analog watch with a stainless steel case and mesh strap.', returnRate: 0.052, popularity: 72, stock: 18 },
]

import type { MerchantOrder } from '../types/api'
const rp = (p: number): Risk => (p >= 0.6 ? 'HIGH' : p >= 0.35 ? 'MEDIUM' : 'LOW')
const o = (id: string, customer: string, date: string, items: [string, number, number][], status: MerchantOrder['status'], p: number, crr: number, cn: number): MerchantOrder => ({
  id, customer, email: `${customer.split(' ')[0].toLowerCase()}@example.com`, date, items: items.map(([name, quantity, price]) => ({ name, quantity, price })),
  revenue: items.reduce((s, [, q, pr]) => s + q * pr, 0), status, risk: rp(p), returnProbability: p, customerReturnRate: crr, customerOrders: cn })
export const mockOrders: MerchantOrder[] = [
  o('ORD-10492', 'Aarav Mehta', '2026-10-02', [['Nike Air Max 270', 1, 12995]], 'Processing', 0.734, 0.22, 9),
  o('ORD-10491', 'Diya Nair', '2026-10-02', [['Levi’s 511 Slim Jeans', 2, 3299]], 'Shipped', 0.58, 0.14, 6),
  o('ORD-10488', 'Rohan Iyer', '2026-10-01', [['boAt Rockerz 450', 1, 1499], ['Fastrack Analog Watch', 1, 2195]], 'Delivered', 0.18, 0.03, 12),
  o('ORD-10480', 'Sneha Reddy', '2026-09-30', [['Puma Running Shorts', 3, 1799]], 'Returned', 0.64, 0.31, 8),
  o('ORD-10477', 'Kabir Shah', '2026-09-29', [['Nike Air Max 270', 1, 12995], ['Puma Running Shorts', 1, 1799]], 'Delivered', 0.69, 0.27, 5),
  o('ORD-10471', 'Meera Pillai', '2026-09-29', [['boAt Rockerz 450', 2, 1499]], 'Cancelled', 0.21, 0.05, 3),
]

import type { Customer, WeeklyReport } from '../types/api'
const cu = (id: string, name: string, orders: number, revenue: number, rr: number, ret: boolean, cats: string[], history: Customer['history']): Customer => ({ id, name, orders, revenue, returnRate: rr, risk: rp(rr * 2), returningCustomer: ret, favoriteCategories: cats, history })
export const mockCustomers: Customer[] = [
  cu('c1', 'Aarav Mehta', 9, 71200, 0.22, true, ['Footwear', 'Apparel'], [{ orderId: 'ORD-10492', date: '2026-10-02', amount: 12995, returned: false }, { orderId: 'ORD-10310', date: '2026-09-11', amount: 8990, returned: true }]),
  cu('c2', 'Diya Nair', 6, 28400, 0.14, true, ['Apparel'], [{ orderId: 'ORD-10491', date: '2026-10-02', amount: 6598, returned: false }]),
  cu('c3', 'Rohan Iyer', 12, 49800, 0.03, true, ['Electronics', 'Accessories'], [{ orderId: 'ORD-10488', date: '2026-10-01', amount: 3694, returned: false }]),
  cu('c4', 'Sneha Reddy', 8, 33100, 0.31, true, ['Apparel'], [{ orderId: 'ORD-10480', date: '2026-09-30', amount: 5397, returned: true }]),
  cu('c5', 'Kabir Shah', 1, 14794, 0, false, ['Footwear'], [{ orderId: 'ORD-10477', date: '2026-09-29', amount: 14794, returned: false }]),
]
export const mockReport: WeeklyReport = {
  period: 'September 23 – September 30', generatedAt: '2026-09-30',
  summary: 'Revenue increased 12.4% compared with the previous week, while the return rate rose slightly to 11.6%. Footwear and apparel account for most of the increase in returns.',
  metrics: [{ label: 'Revenue', value: '$4.82L', change: 12.4 }, { label: 'Orders', value: '2,841', change: 8.1 }, { label: 'Return rate', value: '11.6%', change: 1.3, invertGood: true }, { label: 'Gross profit', value: '$1.49L', change: 9.7 }, { label: 'AOV', value: '$1,697', change: 3.9 }],
  changes: ['Footwear revenue grew 18%, led by Nike Air Max 270.', 'Apparel return rate rose from 12.1% to 14.6%.', 'Electronics returns stayed flat at about 6.7%.', 'High-risk orders increased by 5.2%.'],
  attention: [{ name: 'Nike Air Max 270', note: '18.2% return rate; $12,400 potential loss.' }, { name: 'Puma Running Shorts', note: '15.9% return rate; sizing complaints likely.' }],
  recommendations: ['Add a size guide and fit notes to footwear and apparel listings.', 'Review fulfilment checks for orders with return probability above 60%.', 'Promote boAt Rockerz 450: high volume with a low return rate.'],
}

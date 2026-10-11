import type { AgentResponse, Customer,CustomerHistory, WeeklyReport, DashboardAnalytics, Order, OrderInput, MerchantOrder, ProductStat, RiskPrediction } from '../types/api'
import { mockAgent, mockCustomers, mockReport, mockDashboard, mockOrders, mockProducts } from '../mock/data'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const USE_MOCK_FALLBACK = true // set false once the backend is stable

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}
async function withFallback<T>(call: () => Promise<T>, fallback: () => T): Promise<T> {
  try { return await call() } catch (e) { if (USE_MOCK_FALLBACK) return fallback(); throw e }
}

// Adapter layer: map backend shapes to frontend types here, nowhere else.
export const getDashboardAnalytics = () =>
  withFallback<DashboardAnalytics>(async () => {
    await Promise.all([http<unknown>('/analytics/revenue'), http<unknown>('/analytics/products')])
    throw new Error('Adapter not implemented') // TODO: map /analytics/* responses to DashboardAnalytics
  }, () => mockDashboard)

export const predictReturnRisk = (orderId: string) =>
  withFallback<RiskPrediction>(() => http('/predictions/return-risk', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),
    () => ({ probability: 0.734, risk: 'HIGH' }))

export const askAIAnalyst = (question: string) =>
  withFallback<AgentResponse>(() => http('/agent/query', { method: 'POST', body: JSON.stringify({ question }) }), () => mockAgent(question))

export const createOrder = (input: OrderInput) =>
  withFallback<Order>(() => http('/orders', { method: 'POST', body: JSON.stringify(input) }),
    () => ({ id: `ORD-${Date.now().toString().slice(-6)}`, total: input.total, status: 'Processing', estimatedDelivery: '3–5 days' }))
// TODO: getOrders, getProducts, getCustomers, getWeeklyReport follow the same pattern.
export const getProducts = () =>
  withFallback<ProductStat[]>(
    async () => {
      const data = await http<any[]>('/products/')

      return data.map(p => ({
        id: String(p.id),
        name: p.name ?? 'Unknown',
        category: p.category ?? 'Unknown',
        brand: p.brand ?? 'Unknown',

        revenue: Number(p.revenue) || 0,

        orders: Number(p.orders) || 0,

        returnRate:
          Number(
            p.returnRate ??
            p.returnrate ??
            p.return_rate
          ) || 0,

        profit:
          Number(
            p.profit ??
            p.gross_profit
          ) || 0,

        risk: p.risk ?? 'LOW',
      }))
    },

    () => []
  )
export const getOrders = () => withFallback<MerchantOrder[]>(() => http('/orders'), () => mockOrders)
export const getCustomers = () => withFallback<Customer[]>(() => http('/users'), () => mockCustomers)
export const getUserHistory = (userId: string) => withFallback<CustomerHistory>(() => http<CustomerHistory>(`/users/${userId}`), () => ({ favoriteCategories: [], history: [] }))
export const getWeeklyReport = () => withFallback<WeeklyReport>(() => http('/reports/weekly'), () => ({ ...mockReport, generatedAt: new Date().toISOString().slice(0, 10) }))

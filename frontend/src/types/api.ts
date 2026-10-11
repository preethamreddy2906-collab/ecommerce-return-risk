export type Risk = 'LOW' | 'MEDIUM' | 'HIGH'
export interface Kpi { key: string; label: string; value: string; change: number; invertGood?: boolean }
export interface TimePoint { date: string; revenue: number; orders: number; profit: number; returnRate: number }
export interface ProductStat { id: string; name: string; category: string; brand:string; revenue: number; orders: number; returnRate: number; profit: number; risk: Risk }
export interface DashboardAnalytics { kpis: Kpi[]; series: TimePoint[]; products: ProductStat[] }
export interface AgentResponse { question: string; sql: string; result: Record<string, string | number>[]; answer: string }
export interface OrderInput { customerId: string; total: number; items: { productId: string; quantity: number }[] }
export interface Order { id: string; total: number; status: string; estimatedDelivery: string }
export interface RiskPrediction { probability: number; risk: Risk }
export interface Product { id: string; name: string; brand: string; category: string; price: number; rating: number; description: string; returnRate: number; popularity: number; stock: number }
export interface CartLine { product: Product; quantity: number }
export interface PlacedOrder extends Order { placedAt: string; lines: CartLine[] }
export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled'
export interface MerchantOrder { id: string; customer: string; email: string; date: string; items: { name: string; quantity: number; price: number }[]; revenue: number; status: OrderStatus; risk: Risk; returnProbability: number | null; customerReturnRate: number; customerOrders: number }
export interface Customer { id: string; name: string; orders: number; revenue: number; returnRate: number; risk: Risk; returningCustomer: boolean; favoriteCategories: string[]; history: { orderId: string; date: string; amount: number; returned: boolean }[] }
export interface CustomerHistory {
  favoriteCategories: string[]
  history: {
    orderId: string
    date: string
    amount: number
    returned: boolean
  }[]
}
export interface WeeklyReport { period: string; summary: string; metrics: { label: string; value: string; change: number; invertGood?: boolean }[]; changes: string[]; attention: { name: string; note: string }[]; recommendations: string[]; generatedAt: string }

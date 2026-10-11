import { Navigate, Route, Routes } from 'react-router-dom'
import CustomerLayout from './layouts/CustomerLayout'
import MerchantLayout from './layouts/MerchantLayout'
import Overview from './pages/merchant/Overview'
import MerchantOrders from './pages/merchant/Orders'
import MerchantProducts from './pages/merchant/Products'
import Customers from './pages/merchant/Customers'
import Reports from './pages/merchant/Reports'
import AiAnalyst from './pages/merchant/AiAnalyst'
import Stub from './pages/Stub'
import Shop from './pages/customer/Shop'
import ProductPage from './pages/customer/Product'
import Cart from './pages/customer/Cart'
import Orders from './pages/customer/Orders'
export default function App() {
  return (<Routes>
    <Route path="/" element={<Navigate to="/shop" replace />} />
    <Route element={<CustomerLayout />}>
      <Route path="/shop" element={<Shop />} /><Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={<Cart />} /><Route path="/orders" element={<Orders />} /></Route>
    <Route path="/merchant" element={<MerchantLayout />}>
      <Route index element={<Overview />} />
      <Route path="orders" element={<MerchantOrders />} /><Route path="products" element={<MerchantProducts />} />
      <Route path="customers" element={<Customers />} /><Route path="reports" element={<Reports />} />
      <Route path="ai-analyst" element={<AiAnalyst />} /></Route>
  </Routes>)
}

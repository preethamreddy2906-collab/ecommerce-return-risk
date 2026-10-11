import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './context/ToastContext'
import { CartProvider } from './context/CartContext'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><ToastProvider><CartProvider><App /></CartProvider></ToastProvider></BrowserRouter></React.StrictMode>)

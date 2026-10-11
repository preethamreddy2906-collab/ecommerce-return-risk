import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
type Kind = 'success' | 'error'
interface T { id: number; kind: Kind; text: string }
const C = createContext<{ toast: (kind: Kind, text: string) => void } | null>(null)
export const useToast = () => { const c = useContext(C); if (!c) throw new Error('ToastProvider missing'); return c.toast }
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([])
  const toast = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random(); setItems(i => [...i, { id, kind, text }]); setTimeout(() => setItems(i => i.filter(t => t.id !== id)), 4000)
  }, [])
  return (<C.Provider value={{ toast }}>{children}
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>{items.map(t => (
        <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm shadow-md">
          {t.kind === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-red-600" />}{t.text}</motion.div>))}</AnimatePresence></div></C.Provider>)
}

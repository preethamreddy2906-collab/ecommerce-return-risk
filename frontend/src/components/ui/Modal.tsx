import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (<div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()} className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={18} /></button></div>{children}</div></div>)
}

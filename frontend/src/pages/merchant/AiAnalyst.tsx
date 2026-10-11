import { useRef, useState } from 'react'
import { ChevronDown, Send, Trash2 } from 'lucide-react'
import { askAIAnalyst } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import type { AgentResponse } from '../../types/api'
type Msg = { id: number; role: 'user' | 'ai'; at: string; text?: string; res?: AgentResponse; error?: boolean; pending?: boolean }
const suggestions = ['Which products had the highest return rate last month?', 'Which products are causing the most losses?', 'Compare revenue between categories.', 'Which products have high revenue but high return risk?']
const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
const KW = /(\b(?:SELECT|FROM|JOIN|ON|WHERE|GROUP BY|ORDER BY|LIMIT|SUM|CASE|WHEN|THEN|ELSE|END|AS|DESC)\b)/g
export default function AiAnalyst() {
  const toast = useToast()
  const [msgs, setMsgs] = useState<Msg[]>([]); const [q, setQ] = useState(''); const id = useRef(0)
  const busy = msgs.some(m => m.pending)
  async function ask(text: string) {
    if (!text.trim() || busy) return
    const uid = ++id.current, aiId = ++id.current; setQ('')
    setMsgs(m => [...m, { id: uid, role: 'user', at: now(), text }, { id: aiId, role: 'ai', at: now(), pending: true }])
    try { const res = await askAIAnalyst(text); setMsgs(m => m.map(x => x.id === aiId ? { ...x, pending: false, res, at: now() } : x)) }
    catch { toast('error', 'AI Analyst request failed'); setMsgs(m => m.map(x => x.id === aiId ? { ...x, pending: false, error: true, text: 'The analyst could not answer. Check that the backend is running and try again.' } : x)) }
  }
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <div className="mb-4 flex items-end justify-between"><div><h1 className="text-2xl font-semibold">AI Business Analyst</h1><p className="text-slate-500">Ask questions about your store in natural language.</p></div>
        {msgs.length > 0 && <button onClick={() => setMsgs([])} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><Trash2 size={14} />Clear conversation</button>}</div>
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4" aria-live="polite">
        {msgs.length === 0 && <div className="py-8"><p className="mb-3 text-sm text-slate-500">Try asking:</p><div className="flex flex-wrap gap-2">
          {suggestions.map(s => <button key={s} onClick={() => ask(s)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">{s}</button>)}</div></div>}
        {msgs.map(m => m.role === 'user'
          ? <div key={m.id} className="ml-auto max-w-xl rounded-lg bg-brand-600 px-4 py-2 text-white"><p>{m.text}</p><p className="mt-1 text-right text-xs text-indigo-200">{m.at}</p></div>
          : <div key={m.id} className="max-w-3xl rounded-lg border border-slate-200 bg-slate-50 p-4">
            {m.pending && <p className="animate-pulse text-sm text-slate-500">Analyzing your business data…</p>}
            {m.error && <p role="alert" className="text-sm text-red-700">{m.text}</p>}
            {m.res && <Answer r={m.res} />}
            {!m.pending && <p className="mt-2 text-xs text-slate-400">{m.at}</p>}</div>)}
      </div>
      <form onSubmit={e => { e.preventDefault(); ask(q) }} className="mt-3 flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} aria-label="Ask a question" placeholder="Ask about revenue, returns, products, customers…" className="flex-1 rounded-md border border-slate-300 px-3 py-2" />
        <button disabled={busy || !q.trim()} className="flex items-center gap-2 rounded-md bg-brand-600 px-4 text-white disabled:opacity-50"><Send size={16} />Ask</button></form>
    </div>)
}
function Answer({ r }: { r: AgentResponse }) {
  const [show, setShow] = useState(false); const cols = r.result[0] ? Object.keys(r.result[0]) : []
  return (<div className="space-y-3">
    <div><h3 className="text-sm font-semibold">AI answer</h3><p className="text-sm">{r.answer}</p></div>
    {cols.length > 0 && <div className="overflow-x-auto rounded border border-slate-200 bg-white"><h3 className="px-3 pt-2 text-sm font-semibold">Data</h3>
      <table className="w-full text-left text-sm"><thead className="text-slate-500"><tr>{cols.map(c => <th key={c} className="px-3 py-1.5 font-medium">{c.replace(/_/g, ' ')}</th>)}</tr></thead>
        <tbody>{r.result.map((row, i) => <tr key={i} className="border-t border-slate-100">{cols.map(c => <td key={c} className="px-3 py-1.5 tabular-nums">{typeof row[c] === 'number' ? (row[c] as number).toLocaleString('en-IN') : row[c]}</td>)}</tr>)}</tbody></table></div>}
    <button onClick={() => setShow(s => !s)} aria-expanded={show} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronDown size={14} className={show ? 'rotate-180' : ''} />Generated SQL</button>
    {show && <pre className="overflow-x-auto rounded bg-navy-900 p-3 text-xs text-slate-200">{r.sql.split(KW).map((t, i) => i % 2 ? <span key={i} className="text-indigo-300">{t}</span> : t)}</pre>}
  </div>)
}

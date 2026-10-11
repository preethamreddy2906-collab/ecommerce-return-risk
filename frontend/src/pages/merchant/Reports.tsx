import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getWeeklyReport } from '../../api/client'
import { useAsync } from '../../hooks'
import { useToast } from '../../context/ToastContext'
import { KpiCard } from '../../components/ui/KpiCard'
export default function Reports() {
  const toast = useToast(); const [n, setN] = useState(0); const [busy, setBusy] = useState(false)
  const { data: r, loading, error } = useAsync(async () => { setBusy(true); try { return await getWeeklyReport() } finally { setBusy(false) } }, [n])
  useEffect(() => { if (n > 0 && r && !loading) toast('success', 'Report generated') }, [r]) // eslint-disable-line
  const H = ({ t }: { t: string }) => <h2 className="mb-2 text-lg font-semibold">{t}</h2>
  return (<div className="mx-auto max-w-3xl space-y-8">
    <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4"><div><h1 className="text-2xl font-semibold">AI Business Report</h1><p className="text-slate-500">Report period: {r?.period ?? '…'}</p></div>
      <button onClick={() => setN(x => x + 1)} disabled={busy} className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-60"><RefreshCw size={14} className={busy ? 'animate-spin' : ''} />{busy ? 'Generating…' : 'Generate new report'}</button></header>
    {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">Couldn't generate the report: {error}. Try again.</p>}
    {loading && !r ? <div className="h-64 animate-pulse rounded-lg bg-white" /> : r && <>
      <section><H t="Executive summary" /><p className="leading-relaxed text-slate-700">{r.summary}</p></section>
      <section><H t="Key metrics" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{r.metrics.map(m => <KpiCard key={m.label} k={{ key: m.label, ...m }} />)}</div></section>
      <section><H t="What changed" /><ul className="list-disc space-y-1 pl-5 text-slate-700">{r.changes.map(c => <li key={c}>{c}</li>)}</ul></section>
      <section><H t="Products requiring attention" /><ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">{r.attention.map(a => <li key={a.name} className="p-3 text-sm"><span className="font-medium">{a.name}</span><span className="text-slate-500"> — {a.note}</span></li>)}</ul></section>
      <section><H t="Recommendations" /><ol className="list-decimal space-y-1 pl-5 text-slate-700">{r.recommendations.map(c => <li key={c}>{c}</li>)}</ol></section>
      <p className="text-xs text-slate-400">Generated automatically on {r.generatedAt} from store data.</p></>}
  </div>)
}

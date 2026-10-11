const tints = ['bg-indigo-100 text-indigo-700', 'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700']
export function ProductImage({ name, id, large }: { name: string; id: string; large?: boolean }) {
  return <div role="img" aria-label={name} className={`flex items-center justify-center font-semibold ${tints[Number(id.replace(/\D/g, '')) % tints.length]} ${large ? 'aspect-square rounded-lg text-6xl' : 'aspect-[4/3] rounded-t-lg text-4xl'}`}>{name.slice(0, 2)}</div>
}

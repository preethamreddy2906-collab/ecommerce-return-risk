import { useMemo, useState } from 'react'
import { getProducts } from '../../api/client'
import { useAsync } from '../../hooks'
import { RiskBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import type { ProductStat } from '../../types/api'
import { inr } from '../../utils'

type Row = ProductStat

const sel =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm'

function group(rows: Row[], key: 'category' | 'brand') {
  const m = new Map<
    string,
    {
      revenue: number
      profit: number
      wr: number
      orders: number
    }
  >()

  rows.forEach(r => {
    const groupName = r[key] || 'Unknown'

    const g = m.get(groupName) ?? {
      revenue: 0,
      profit: 0,
      wr: 0,
      orders: 0,
    }

    g.revenue += Number(r.revenue) || 0
    g.profit += Number(r.profit) || 0
    g.wr += (Number(r.returnRate) || 0) * (Number(r.orders) || 0)
    g.orders += Number(r.orders) || 0

    m.set(groupName, g)
  })

  return [...m].map(([name, g]) => ({
    name,
    ...g,
    returnRate: g.orders > 0 ? g.wr / g.orders : 0,
  }))
}

export default function Products() {
  const {
    data,
    loading,
    error,
  } = useAsync(getProducts)

  const [cat, setCat] = useState('All')
  const [brand, setBrand] = useState('All')
  const [risk, setRisk] = useState('All')
  const [minRev, setMinRev] = useState(0)

  const [sort, setSort] =
    useState<keyof Row>('revenue')

  const [desc, setDesc] = useState(true)

  const [open, setOpen] =
    useState<Row | null>(null)

  const all: Row[] = useMemo(
    () => data ?? [],
    [data]
  )

  const rows = useMemo(
    () =>
      [...all]
        .filter(
          r =>
            (cat === 'All' ||
              r.category === cat) &&
            (brand === 'All' ||
              r.brand === brand) &&
            (risk === 'All' ||
              r.risk === risk) &&
            r.revenue >= minRev
        )
        .sort((x, y) => {
          const a = x[sort]
          const b = y[sort]

          if (a === b) return 0

          if (typeof a === 'number' && typeof b === 'number') {
            return desc ? b - a : a - b
          }

          return desc
            ? String(b).localeCompare(String(a))
            : String(a).localeCompare(String(b))
        }),
    [
      all,
      cat,
      brand,
      risk,
      minRev,
      sort,
      desc,
    ]
  )

  const opts = (
    k: 'category' | 'brand'
  ) => [
    'All',
    ...Array.from(
      new Set(
        all
          .map(r => r[k])
          .filter(Boolean)
      )
    ),
  ]

  const head = (
    k: keyof Row,
    label: string
  ) => (
    <th
      key={k}
      className="px-4 py-2 font-medium"
    >
      <button
        type="button"
        onClick={() => {
          setDesc(
            sort === k
              ? !desc
              : true
          )

          setSort(k)
        }}
      >
        {label}
        {sort === k
          ? desc
            ? ' ↓'
            : ' ↑'
          : ''}
      </button>
    </th>
  )

  const best = [...all].sort(
    (x, y) => y.profit - x.profit
  )

  const Group = ({
    title,
    k,
  }: {
    title: string
    k: 'category' | 'brand'
  }) => (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-2 font-semibold">
        {title}
      </h2>

      <table className="w-full text-left text-sm">
        <tbody>
          {group(all, k)
            .sort(
              (x, y) =>
                y.revenue - x.revenue
            )
            .map(g => (
              <tr
                key={g.name}
                className="border-t border-slate-100"
              >
                <td className="py-1.5">
                  {g.name}
                </td>

                <td className="tabular-nums">
                  {inr(g.revenue)}
                </td>

                <td className="text-right tabular-nums text-slate-500">
                  {(
                    g.returnRate * 100
                  ).toFixed(1)}
                  % returns
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Products
        </h1>

        <p className="text-slate-500">
          Revenue, returns and return
          risk by product.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          Couldn't load products:{' '}
          {error}
        </p>
      )}

      {/* Category / Brand performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Group
          title="Category performance"
          k="category"
        />

        <Group
          title="Brand performance"
          k="brand"
        />
      </div>

      {/* Top / Worst products */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          [
            'Top products',
            best.slice(0, 3),
          ],
          [
            'Worst products',
            best
              .slice(-3)
              .reverse(),
          ],
        ].map(([title, list]) => (
          <section
            key={title as string}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <h2 className="mb-2 font-semibold">
              {title as string} by gross
              profit
            </h2>

            <ul className="text-sm">
              {(list as Row[]).map(
                r => (
                  <li
                    key={r.id}
                    className="flex justify-between border-t border-slate-100 py-1.5"
                  >
                    <span>
                      {r.name}
                    </span>

                    <span className="tabular-nums">
                      {inr(r.profit)}
                    </span>
                  </li>
                )
              )}
            </ul>
          </section>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">

        <select
          aria-label="Category"
          value={cat}
          onChange={e =>
            setCat(e.target.value)
          }
          className={sel}
        >
          {opts('category').map(
            o => (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </select>

        <select
          aria-label="Brand"
          value={brand}
          onChange={e =>
            setBrand(e.target.value)
          }
          className={sel}
        >
          {opts('brand').map(
            o => (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </select>

        <select
          aria-label="Risk"
          value={risk}
          onChange={e =>
            setRisk(e.target.value)
          }
          className={sel}
        >
          {[
            'All',
            'LOW',
            'MEDIUM',
            'HIGH',
          ].map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          aria-label="Minimum revenue"
          value={minRev}
          onChange={e =>
            setMinRev(
              Number(e.target.value)
            )
          }
          className={sel}
        >
          {[0, 30000, 50000].map(
            v => (
              <option
                key={v}
                value={v}
              >
                {v
                  ? `Revenue ≥ ${inr(v)}`
                  : 'Any revenue'}
              </option>
            )
          )}
        </select>

      </div>

      {/* Product table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">

          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              {head(
                'name',
                'Product'
              )}

              {head(
                'category',
                'Category'
              )}

              {head(
                'revenue',
                'Revenue'
              )}

              {head(
                'orders',
                'Units sold'
              )}

              {head(
                'returnRate',
                'Return rate'
              )}

              {head(
                'profit',
                'Gross profit'
              )}

              {head(
                'risk',
                'Return risk'
              )}
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6"
                >
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No products match
                  these filters.
                </td>
              </tr>
            ) : (
              rows.map(r => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() =>
                    setOpen(r)
                  }
                  onKeyDown={e => {
                    if (
                      e.key ===
                      'Enter'
                    ) {
                      setOpen(r)
                    }
                  }}
                  className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 font-medium">
                    {r.name}
                  </td>

                  <td className="px-4 py-2">
                    {r.category}
                  </td>

                  <td className="px-4 py-2 tabular-nums">
                    {inr(r.revenue)}
                  </td>

                  <td className="px-4 py-2 tabular-nums">
                    {r.orders}
                  </td>

                  <td className="px-4 py-2 tabular-nums">
                    {(
                      r.returnRate * 100
                    ).toFixed(1)}
                    %
                  </td>

                  <td className="px-4 py-2 tabular-nums">
                    {inr(r.profit)}
                  </td>

                  <td className="px-4 py-2">
                    <RiskBadge
                      risk={r.risk}
                    />
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

      {/* Product details */}
      {open && (
        <Modal
          title={open.name}
          onClose={() =>
            setOpen(null)
          }
        >
          <p className="text-sm text-slate-500">
            {open.brand} ·{' '}
            {open.category}
          </p>

          <div>
            <h3 className="mb-1 text-sm font-semibold">
              Return risk
            </h3>

            <RiskBadge
              risk={open.risk}
            />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">

            {[
              [
                'Revenue',
                inr(open.revenue),
              ],
              [
                'Units sold',
                open.orders,
              ],
              [
                'Return rate',
                `${(
                  open.returnRate *
                  100
                ).toFixed(1)}%`,
              ],
              [
                'Gross profit',
                inr(open.profit),
              ],
            ].map(
              ([k, v]) => (
                <div key={k}>
                  <dt className="text-slate-500">
                    {k}
                  </dt>

                  <dd className="font-medium">
                    {v}
                  </dd>
                </div>
              )
            )}

          </dl>
        </Modal>
      )}

    </div>
  )
}
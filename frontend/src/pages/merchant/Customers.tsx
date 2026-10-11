import { useState } from 'react'
import { getCustomers, getUserHistory } from '../../api/client'
import { useAsync } from '../../hooks'
import { RiskBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import type { Customer } from '../../types/api'
import { inr } from '../../utils'

export default function Customers() {
  const { data, loading, error } = useAsync(getCustomers)

  const [open, setOpen] = useState<Customer | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const n = data?.length ?? 0

  const orders =
    data?.reduce((s, c) => s + c.orders, 0) ?? 0

  const rev =
    data?.reduce((s, c) => s + c.revenue, 0) ?? 0

  const stats = n
    ? [
        [
          'Total customers',
          String(n)
        ],
        [
          'Returning customers',
          String(
            data!.filter(c => c.returningCustomer).length
          )
        ],
        [
          'Avg customer value',
          inr(Math.round(rev / n))
        ],
        [
          'Avg order value',
          orders > 0
            ? inr(Math.round(rev / orders))
            : '$0'
        ],
        [
          'Customer return rate',
          orders > 0
            ? `${(
                data!.reduce(
                  (s, c) =>
                    s + c.returnRate * c.orders,
                  0
                ) /
                orders *
                100
              ).toFixed(1)}%`
            : '0%'
        ]
      ]
    : []

  // Fetch detailed information when a customer is clicked
  const handleCustomerClick = async (
    customer: Customer
  ) => {
    // Open modal immediately
    setOpen(customer)

    // Show loading state
    setHistoryLoading(true)

    try {
      const details = await getUserHistory(customer.id)

      // Add the fetched history/details to the
      // existing customer object
      setOpen({
        ...customer,
        favoriteCategories:
          details.favoriteCategories,
        history: details.history
      })
    } catch (error) {
      console.error(
        'Failed to load customer history:',
        error
      )
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Customers
        </h1>

        <p className="text-slate-500">
          Who buys, how much, and who returns.
        </p>
      </div>


      {/* ERROR */}
      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          Couldn't load customers: {error}
        </p>
      )}


      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

        {loading
          ? [0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-white"
              />
            ))
          : stats.map(([k, v]) => (
              <div
                key={k}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="text-sm text-slate-500">
                  {k}
                </p>

                <p className="text-xl font-semibold tabular-nums">
                  {v}
                </p>
              </div>
            ))}
      </div>


      {/* CUSTOMER TABLE */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">

        <table className="w-full text-left text-sm">

          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">

            <tr>
              {[
                'Customer',
                'Orders',
                'Revenue',
                'AOV',
                'Return rate',
                'Risk'
              ].map(h => (
                <th
                  key={h}
                  className="px-4 py-2 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>

          </thead>


          <tbody>

            {data?.map(c => (
              <tr
                key={c.id}
                tabIndex={0}

                onClick={() =>
                  handleCustomerClick(c)
                }

                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleCustomerClick(c)
                  }
                }}

                className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              >

                {/* CUSTOMER */}
                <td className="px-4 py-2 font-medium">
                  {c.name}
                </td>


                {/* ORDERS */}
                <td className="px-4 py-2">
                  {c.orders}
                </td>


                {/* REVENUE */}
                <td className="px-4 py-2 tabular-nums">
                  {inr(c.revenue)}
                </td>


                {/* AOV */}
                <td className="px-4 py-2 tabular-nums">
                  {c.orders > 0
                    ? inr(
                        Math.round(
                          c.revenue / c.orders
                        )
                      )
                    : '$0'}
                </td>


                {/* RETURN RATE */}
                <td className="px-4 py-2">
                  {(c.returnRate * 100).toFixed(0)}%
                </td>


                {/* RISK */}
                <td className="px-4 py-2">
                  <RiskBadge risk={c.risk} />
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>


      {/* CUSTOMER DETAILS MODAL */}

      {open && (
        <Modal
          title={open.name}
          onClose={() => {
            setOpen(null)
            setHistoryLoading(false)
          }}
        >

          {/* CUSTOMER SUMMARY */}

          <dl className="grid grid-cols-3 gap-3 text-sm">

            <div>
              <dt className="text-slate-500">
                Total spending
              </dt>

              <dd className="font-medium">
                {inr(open.revenue)}
              </dd>
            </div>


            <div>
              <dt className="text-slate-500">
                Orders
              </dt>

              <dd className="font-medium">
                {open.orders}
              </dd>
            </div>


            <div>
              <dt className="text-slate-500">
                Return rate
              </dt>

              <dd className="font-medium">
                {(open.returnRate * 100).toFixed(0)}%
              </dd>
            </div>

          </dl>


          {/* RISK */}

          <div className="flex items-center gap-2 text-sm">

            <span className="text-slate-500">
              Risk:
            </span>

            <RiskBadge risk={open.risk} />

          </div>


          {/* FAVORITE CATEGORIES */}

          <p className="text-sm">

            <span className="text-slate-500">
              Favorite categories:{' '}
            </span>

            {historyLoading ? (
              'Loading...'
            ) : open.favoriteCategories.length > 0 ? (
              open.favoriteCategories.join(', ')
            ) : (
              'No data'
            )}

          </p>


          {/* PURCHASE HISTORY */}

          <h3 className="text-sm font-semibold">
            Recent purchases
          </h3>


          {historyLoading ? (

            <div className="py-4 text-sm text-slate-500">
              Loading purchase history...
            </div>

          ) : open.history.length === 0 ? (

            <div className="py-4 text-sm text-slate-500">
              No purchases found.
            </div>

          ) : (

            <ul className="divide-y divide-slate-100 text-sm">

              {open.history.map(h => (

                <li
                  key={h.orderId}
                  className="flex justify-between py-1.5"
                >

                  <span>
                    {h.orderId}
                    {' · '}
                    {new Date(
                      h.date
                    ).toLocaleDateString('en-IN')}
                  </span>


                  <span>

                    {inr(h.amount)}

                    {h.returned && (
                      <span className="ml-2 text-red-600">
                        Returned
                      </span>
                    )}

                  </span>

                </li>

              ))}

            </ul>

          )}

        </Modal>
      )}

    </div>
  )
}

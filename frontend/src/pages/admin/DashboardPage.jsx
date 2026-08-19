import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/axios'

function StatCard({ label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:    'bg-red-50 text-red-700 border-red-200',
    gray:   'bg-gray-50 text-gray-700 border-gray-200',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
            <StatCard label="Total Customer" value={stats?.total_customers} color="blue" />
            <StatCard label="Total Tiket" value={stats?.total_tickets} color="gray" />
            <StatCard label="Tiket Terjual" value={stats?.total_sold} color="blue" />
            <StatCard label="Sudah Hadir" value={stats?.total_present} color="green" />
            <StatCard label="Belum Hadir" value={stats?.total_absent} color="yellow" />
          </div>

          {/* Statistik Kategori */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Statistik per Kategori</h2>
            {stats?.category_stats?.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data.</p>
            ) : (
              <div className="space-y-3">
                {stats?.category_stats?.map((cat) => {
                  const total = stats.total_tickets || 1
                  const pct = Math.round((cat.total / total) * 100)
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <span className="text-gray-500">{cat.total} tiket</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}

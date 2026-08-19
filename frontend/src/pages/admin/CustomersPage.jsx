import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/axios'

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

// Buat WA direct link — tidak butuh WhatsApp API
// Format nomor: hilangkan leading 0, ganti dengan 62
function buildWhatsAppLink(phone, customerName, orderNumber, ticketUuids, appUrl) {
  // Normalisasi nomor telepon ke format internasional
  let normalized = phone.replace(/\D/g, '') // buang karakter non-digit
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.slice(1)
  } else if (!normalized.startsWith('62')) {
    normalized = '62' + normalized
  }

  // Buat baris link tiket
  const ticketLines = ticketUuids.map((uuid, i) =>
    `Tiket ${i + 1}: ${appUrl}/ticket/${uuid}`
  ).join('\n')

  const message =
    `Halo ${customerName}! 👋\n\n` +
    `Berikut e-ticket Anda untuk order *${orderNumber}*:\n\n` +
    `${ticketLines}\n\n` +
    `Tunjukkan QR Code pada tiket saat memasuki area event.\n` +
    `Terima kasih! 🎟️`

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

// Modal konfirmasi hapus
function DeleteModal({ customer, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Hapus Customer</h3>
            <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Nama</span>
            <span className="font-semibold text-gray-800">{customer.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order</span>
            <span className="font-mono text-gray-700">{customer.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tiket</span>
            <span className="text-gray-700">{customer.quantity} tiket</span>
          </div>
        </div>

        <p className="text-sm text-red-600 mb-5">
          Semua data order, tiket, dan kehadiran customer ini akan dihapus permanen.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ payment_status: '', attendance: '' })
  const [page, setPage] = useState(1)

  // State untuk delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Toast notifikasi
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Deteksi base URL app untuk link tiket di pesan WA
  const appUrl = window.location.origin

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, ...filters }
      if (search) params.search = search
      const { data } = await api.get('/admin/customers', { params })
      setCustomers(data.data)
      setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, filters, search])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchData()
  }

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // Hapus customer
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/admin/customers/${deleteTarget.order_number}`)
      showToast(`Customer "${deleteTarget.customer_name}" berhasil dihapus.`)
      setDeleteTarget(null)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.message ?? 'Gagal menghapus customer.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Kirim WA — buka tab baru dengan wa.me direct link
  const handleSendWA = (customer) => {
    if (!customer.customer_phone) {
      showToast('Nomor telepon tidak tersedia.', 'error')
      return
    }
    if (!customer.all_ticket_uuids?.length) {
      showToast('Tiket belum dibuat untuk order ini.', 'error')
      return
    }

    const url = buildWhatsAppLink(
      customer.customer_phone,
      customer.customer_name,
      customer.order_number,
      customer.all_ticket_uuids,
      appUrl
    )

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Modal hapus */}
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <h1 className="text-xl font-bold text-gray-800 mb-4">Customer</h1>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, telepon, order, ticket ID..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Cari
          </button>
        </form>

        <select
          value={filters.payment_status}
          onChange={(e) => handleFilter('payment_status', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status Bayar</option>
          <option value="PAID">PAID</option>
          <option value="UNPAID">UNPAID</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          value={filters.attendance}
          onChange={(e) => handleFilter('attendance', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Kehadiran</option>
          <option value="present">Hadir</option>
          <option value="absent">Belum Hadir</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nama', 'No. Telepon', 'Kategori', 'Order', 'Pembayaran', 'Kehadiran', 'Check-in', 'Aksi'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">Memuat data...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">Tidak ada data.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.order_number} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{c.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.customer_phone}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{c.order_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PaymentBadge status={c.payment_status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AttendanceBadge status={c.attendance} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(c.checked_in_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* Tombol kirim WA — hanya jika sudah PAID dan ada tiket */}
                        {c.payment_status === 'PAID' && c.all_ticket_uuids?.length > 0 && (
                          <button
                            onClick={() => handleSendWA(c)}
                            title="Kirim tiket via WhatsApp"
                            className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <WhatsAppIcon />
                            WA
                          </button>
                        )}
                        {/* Tombol hapus */}
                        <button
                          onClick={() => setDeleteTarget(c)}
                          title="Hapus customer"
                          className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors"
                        >
                          <TrashIcon />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>Total: <strong>{meta.total}</strong> data</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              &laquo; Prev
            </button>
            <span className="px-3 py-1 text-gray-600">
              {meta.current_page} / {meta.last_page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next &raquo;
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function PaymentBadge({ status }) {
  const map = {
    PAID:      'bg-green-100 text-green-700',
    UNPAID:    'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
    EXPIRED:   'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

function AttendanceBadge({ status }) {
  if (status === 'PRESENT') {
    return <span className="text-green-600 font-semibold">✓ Hadir</span>
  }
  return <span className="text-gray-400">□ Belum</span>
}

function WhatsAppIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

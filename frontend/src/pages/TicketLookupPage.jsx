import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/axios'

export default function TicketLookupPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderNumber = searchParams.get('order')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputOrder, setInputOrder] = useState(orderNumber ?? '')

  const fetchOrder = async (num) => {
    if (!num) return
    setLoading(true)
    setError(null)
    setOrder(null)
    try {
      const { data } = await api.get(`/orders/${num}`)
      if (data.payment_status !== 'PAID') {
        setError('Order ini belum dibayar.')
        return
      }
      setOrder(data)
    } catch {
      setError('Order tidak ditemukan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderNumber) fetchOrder(orderNumber)
  }, [orderNumber])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/ticket-lookup?order=${inputOrder}`)
    fetchOrder(inputOrder)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white py-4 px-6 shadow">
        <button onClick={() => navigate('/')} className="text-sm text-blue-200 hover:text-white">
          &larr; Beranda
        </button>
        <h1 className="text-lg font-bold mt-1">Lihat E-Ticket</h1>
      </header>

      <div className="max-w-lg mx-auto py-10 px-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={inputOrder}
            onChange={(e) => setInputOrder(e.target.value)}
            placeholder="Masukkan nomor order (ORD-...)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
          >
            Cari
          </button>
        </form>

        {loading && <p className="text-center text-gray-500">Memuat...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {order && (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Tiket untuk order <span className="font-mono font-semibold">{order.order_number}</span>
              {' '}— {order.customer_name}
            </p>
            <div className="space-y-3">
              {/* Kita fetch tiket per UUID — tapi order tidak return ticket UUIDs langsung.
                  Tampilkan link ke scanner untuk tiket, atau arahkan ke endpoint tickets berdasarkan order */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
                <p className="text-gray-500 mb-2">
                  Tiket Anda sudah dibuat. Masukkan Ticket ID di bawah untuk melihat QR Code.
                </p>
                <TTicketSearch />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TTicketSearch() {
  const navigate = useNavigate()
  const [uuid, setUuid] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (uuid.trim()) navigate(`/ticket/${uuid.trim()}`)
      }}
      className="flex gap-2 mt-2"
    >
      <input
        type="text"
        value={uuid}
        onChange={(e) => setUuid(e.target.value)}
        placeholder="Ticket ID (TKT-XXXXXX)"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm"
      >
        Lihat
      </button>
    </form>
  )
}

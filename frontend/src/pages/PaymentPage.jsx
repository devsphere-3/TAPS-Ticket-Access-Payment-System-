import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/axios'

function formatRupiah(amount) {
  return 'Rp' + Number(amount).toLocaleString('id-ID')
}

export default function PaymentPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/orders/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch(() => setError('Order tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  const handlePay = async () => {
    setPaying(true)
    setError(null)
    try {
      const { data } = await api.post('/payment/demo', { order_number: orderNumber })
      const firstUuid = data.tickets?.[0]?.ticket_uuid
      navigate(`/payment-success/${orderNumber}`, { state: { tickets: data.tickets, firstUuid } })
    } catch (err) {
      setError(err.response?.data?.message ?? 'Pembayaran gagal.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat order...</p>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white py-4 px-6 shadow">
        <h1 className="text-lg font-bold">Pembayaran</h1>
      </header>

      <div className="max-w-md mx-auto py-10 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Status badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
              Menunggu Pembayaran
            </span>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">PEMBAYARAN DEMO</h2>

          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Order</span>
              <span className="font-mono font-semibold text-gray-800">{order.order_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Nama</span>
              <span className="text-gray-800">{order.customer_name}</span>
            </div>
            {order.items?.[0] && (
              <>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Kategori</span>
                  <span className="text-gray-800">{order.items[0].category_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="text-gray-800">{order.items[0].quantity} tiket</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-500 font-semibold">Total</span>
              <span className="font-bold text-blue-600 text-base">
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-lg transition-colors text-sm"
          >
            {paying ? 'Memproses...' : 'BAYAR SEKARANG'}
          </button>

          <p className="text-xs text-center text-gray-400 mt-4">
            Ini adalah Demo Payment untuk keperluan pengujian.
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../lib/axios'

export default function PaymentSuccessPage() {
  const { orderNumber } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [order, setOrder] = useState(null)
  const tickets = state?.tickets ?? []
  const firstUuid = state?.firstUuid ?? null

  useEffect(() => {
    api.get(`/orders/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch(console.error)
  }, [orderNumber])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
        {/* Icon success */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1">Pembayaran Berhasil!</h1>
        <p className="text-sm text-gray-500 mb-6">Tiket Anda telah berhasil dibuat.</p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-6 text-left">
          <div className="flex justify-between">
            <span className="text-gray-500">Order</span>
            <span className="font-mono font-semibold text-gray-800">{orderNumber}</span>
          </div>
          {order && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Nama</span>
                <span className="text-gray-800">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tiket dibuat</span>
                <span className="text-gray-800">{tickets.length || '—'}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-green-600 font-semibold">PAID</span>
          </div>
        </div>

        {/* Daftar tiket jika lebih dari 1 */}
        {tickets.length > 1 && (
          <div className="mb-4 text-left space-y-2">
            <p className="text-xs text-gray-500 font-semibold">Tiket Anda:</p>
            {tickets.map((t) => (
              <button
                key={t.ticket_uuid}
                onClick={() => navigate(`/ticket/${t.ticket_uuid}`)}
                className="block w-full text-left px-3 py-2 text-xs font-mono bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg text-blue-600"
              >
                {t.ticket_uuid} — {t.category_name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {firstUuid ? (
            <button
              onClick={() => navigate(`/ticket/${firstUuid}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              Lihat E-Ticket
            </button>
          ) : (
            <button
              onClick={() => navigate('/ticket-lookup')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              Lihat E-Ticket
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )
}

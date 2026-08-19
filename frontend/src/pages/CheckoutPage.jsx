import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../lib/axios'

function formatRupiah(amount) {
  return 'Rp' + Number(amount).toLocaleString('id-ID')
}

export default function CheckoutPage() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    ticket_category_id: state?.category?.id ?? '',
    quantity: 1,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Hitung preview harga
  const selectedCategory = categories.find((c) => c.id === Number(form.ticket_category_id))
  const unitPrice = selectedCategory?.price ?? 0
  const total = unitPrice * form.quantity

  useEffect(() => {
    api.get('/ticket-categories').then((res) => setCategories(res.data))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const { data } = await api.post('/orders', form)
      navigate(`/payment/${data.order_number}`)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white py-4 px-6 shadow">
        <button onClick={() => navigate('/')} className="text-sm text-blue-200 hover:text-white">
          &larr; Kembali
        </button>
        <h1 className="text-lg font-bold mt-1">Checkout</h1>
      </header>

      <div className="max-w-lg mx-auto py-10 px-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Pembelian</h2>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_name ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.customer_name && (
                <p className="text-xs text-red-500 mt-1">{errors.customer_name[0]}</p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={form.customer_phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customer_phone ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.customer_phone && (
                <p className="text-xs text-red-500 mt-1">{errors.customer_phone[0]}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori Tiket <span className="text-red-500">*</span>
              </label>
              <select
                name="ticket_category_id"
                value={form.ticket_category_id}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                  errors.ticket_category_id ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} — {formatRupiah(cat.price)}
                  </option>
                ))}
              </select>
              {errors.ticket_category_id && (
                <p className="text-xs text-red-500 mt-1">{errors.ticket_category_id[0]}</p>
              )}
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Tiket <span className="text-red-500">*</span>
              </label>
              <select
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} tiket</option>
                ))}
              </select>
            </div>

            {/* Ringkasan harga */}
            {selectedCategory && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{selectedCategory.name} × {form.quantity}</span>
                  <span>{formatRupiah(unitPrice)} / tiket</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-200 mt-1">
                  <span>Total</span>
                  <span className="text-blue-600">{formatRupiah(total)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Membuat Order...' : 'Lanjutkan Pembayaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

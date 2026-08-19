import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'

function formatRupiah(amount) {
  return 'Rp' + Number(amount).toLocaleString('id-ID')
}

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/ticket-categories')
      .then((res) => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleBeli = (category) => {
    navigate('/checkout', { state: { category } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white py-4 px-6 flex items-center justify-between shadow">
        <div>
          <h1 className="text-lg font-bold tracking-wide">TAPS</h1>
          <p className="text-xs text-blue-200 leading-tight">Ticket Access & Payment System</p>
        </div>
        <a href="/admin/login" className="text-sm text-blue-200 hover:text-white transition-colors">
          Admin
        </a>
      </header>

      {/* Hero */}
      <section className="bg-blue-700 text-white py-14 px-6 text-center">
        <h2 className="text-3xl font-bold mb-3">Beli Tiket Sekarang</h2>
        <p className="text-blue-100 max-w-md mx-auto text-sm">
          Pilih kategori tiket, isi data, dan dapatkan e-ticket lengkap dengan QR Code secara instan.
        </p>
      </section>

      {/* Kategori Tiket */}
      <section className="max-w-4xl mx-auto py-12 px-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Kategori Tiket</h3>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Memuat kategori...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Belum ada kategori tiket tersedia.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center"
              >
                <h4 className="text-lg font-bold text-gray-800 mb-1">{cat.name}</h4>
                {cat.description && (
                  <p className="text-xs text-gray-500 mb-3">{cat.description}</p>
                )}
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  {formatRupiah(cat.price)}
                </p>
                <button
                  onClick={() => handleBeli(cat)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Beli Tiket
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cara Pembelian */}
      <section className="bg-white py-10 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Cara Pembelian</h3>
          <div className="grid gap-4 sm:grid-cols-4 text-center text-sm text-gray-600">
            {['Pilih Tiket', 'Isi Data', 'Bayar', 'Dapatkan E-Ticket'].map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} TAPS — Ticket Access & Payment System
      </footer>
    </div>
  )
}

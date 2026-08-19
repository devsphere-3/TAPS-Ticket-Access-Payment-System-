import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../lib/axios'

function StatusBadge({ status }) {
  const map = {
    UNUSED: { label: 'Belum Digunakan', cls: 'bg-blue-100 text-blue-700' },
    USED:   { label: 'Sudah Digunakan', cls: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Dibatalkan', cls: 'bg-red-100 text-red-700' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  )
}

export default function ETicketPage() {
  const { ticketUuid } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/tickets/${ticketUuid}`)
      .then((res) => setTicket(res.data))
      .catch(() => setError('Tiket tidak ditemukan.'))
      .finally(() => setLoading(false))
  }, [ticketUuid])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Memuat tiket...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 max-w-sm w-full overflow-hidden">
        {/* Header tiket */}
        <div className="bg-blue-700 text-white text-center py-4 px-6">
          <p className="text-xs tracking-widest uppercase font-semibold text-blue-200 mb-1">
            E-Ticket
          </p>
          <h1 className="text-xl font-bold">Tiket Event</h1>
        </div>

        {/* Dashed separator */}
        <div className="flex items-center px-4">
          <div className="w-5 h-5 bg-gray-100 rounded-full -ml-5 shrink-0 border border-gray-200" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
          <div className="w-5 h-5 bg-gray-100 rounded-full -mr-5 shrink-0 border border-gray-200" />
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-6 px-6">
          <QRCodeSVG
            value={ticket.ticket_uuid}
            size={180}
            level="M"
            className="rounded-lg"
          />
          <p className="text-xs font-mono text-gray-500 mt-3">{ticket.ticket_uuid}</p>
          <div className="mt-2">
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Dashed separator */}
        <div className="flex items-center px-4">
          <div className="w-5 h-5 bg-gray-100 rounded-full -ml-5 shrink-0 border border-gray-200" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
          <div className="w-5 h-5 bg-gray-100 rounded-full -mr-5 shrink-0 border border-gray-200" />
        </div>

        {/* Detail */}
        <div className="px-6 py-5 space-y-3 text-sm">
          <DetailRow label="Nama" value={ticket.customer_name} />
          <DetailRow label="No. Telepon" value={ticket.customer_phone} />
          <DetailRow label="Kategori" value={ticket.category_name} />
          {ticket.attendance?.checked_in_at && (
            <DetailRow
              label="Check-in"
              value={new Date(ticket.attendance.checked_in_at).toLocaleString('id-ID')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <p className="text-xs text-gray-400">
            Tunjukkan QR Code ini kepada petugas saat memasuki area event.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-semibold text-gray-800 text-right">{value}</span>
    </div>
  )
}

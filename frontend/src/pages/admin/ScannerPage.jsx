import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/axios'

const SCAN_REGION_ID = 'qr-reader'

export default function ScannerPage() {
  const [mode, setMode] = useState('camera') // 'camera' | 'manual'
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // hasil scan
  const [manualInput, setManualInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const scannerRef = useRef(null)

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(SCAN_REGION_ID)
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner()
          validateTicket(decodedText.trim())
        },
        undefined
      )
      setScanning(true)
    } catch (err) {
      console.error('Camera error:', err)
      setResult({
        type: 'error',
        message: 'Kamera tidak tersedia. Gunakan input manual.',
      })
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  const validateTicket = async (uuid) => {
    setProcessing(true)
    setResult(null)
    try {
      const { data } = await api.post('/admin/tickets/scan', { ticket_uuid: uuid })
      setResult({
        type: 'success',
        code: data.code,
        message: data.message,
        ticket: data.ticket,
      })
    } catch (err) {
      const data = err.response?.data
      setResult({
        type: data?.code === 'ALREADY_USED' ? 'warning' : 'error',
        code: data?.code,
        message: data?.message ?? 'Terjadi kesalahan.',
        ticket: data?.ticket,
        checked_in_at: data?.checked_in_at,
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    validateTicket(manualInput.trim())
  }

  const handleReset = () => {
    setResult(null)
    setManualInput('')
  }

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Scan Tiket</h1>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Mode Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 flex">
          <button
            onClick={() => { handleReset(); stopScanner(); setMode('camera') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'camera' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Kamera
          </button>
          <button
            onClick={() => { handleReset(); stopScanner(); setMode('manual') }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === 'manual' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Input Manual
          </button>
        </div>

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {/* QR reader div — harus ada di DOM sebelum scanner start */}
            <div id={SCAN_REGION_ID} className="w-full rounded-lg overflow-hidden" />

            {!scanning ? (
              <button
                onClick={startScanner}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm"
              >
                Mulai Kamera
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg text-sm"
              >
                Hentikan
              </button>
            )}

            <p className="text-xs text-center text-gray-400 mt-2">
              Arahkan kamera ke QR Code pada tiket.
            </p>
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket ID
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="TKT-XXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={processing || !manualInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg text-sm"
              >
                {processing ? 'Memvalidasi...' : 'Validasi Tiket'}
              </button>
            </form>
          </div>
        )}

        {/* Processing indicator */}
        {processing && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-500">
            Memvalidasi tiket...
          </div>
        )}

        {/* Result */}
        {result && !processing && (
          <ScanResult result={result} onReset={handleReset} />
        )}
      </div>
    </AdminLayout>
  )
}

function ScanResult({ result, onReset }) {
  const config = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✓',
      iconBg: 'bg-green-100 text-green-700',
      title: 'Tiket Valid',
      titleColor: 'text-green-700',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠',
      iconBg: 'bg-yellow-100 text-yellow-700',
      title: 'Tiket Sudah Digunakan',
      titleColor: 'text-yellow-700',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '✕',
      iconBg: 'bg-red-100 text-red-700',
      title: 'Tiket Tidak Valid',
      titleColor: 'text-red-700',
    },
  }

  const c = config[result.type] ?? config.error

  return (
    <div className={`rounded-xl border p-5 ${c.bg}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${c.iconBg}`}>
          {c.icon}
        </div>
        <div>
          <p className={`font-bold text-base ${c.titleColor}`}>{c.title}</p>
          <p className="text-sm text-gray-600">{result.message}</p>
        </div>
      </div>

      {result.ticket && (
        <div className="bg-white rounded-lg p-4 space-y-2 text-sm mb-4">
          <DetailRow label="Nama" value={result.ticket.customer_name} />
          <DetailRow label="No. Telepon" value={result.ticket.customer_phone} />
          <DetailRow label="Kategori" value={result.ticket.category} />
          <DetailRow label="Ticket ID" value={result.ticket.ticket_uuid} mono />
          {result.ticket.used_at && (
            <DetailRow
              label="Check-in"
              value={new Date(result.ticket.used_at).toLocaleString('id-ID')}
            />
          )}
          {result.checked_in_at && !result.ticket.used_at && (
            <DetailRow
              label="Check-in"
              value={new Date(result.checked_in_at).toLocaleString('id-ID')}
            />
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-50"
      >
        Scan Tiket Lain
      </button>
    </div>
  )
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`font-semibold text-gray-800 text-right ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}

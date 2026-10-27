import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import brand from '../config/brand'
import {
  Scissors, User, Star, Clock, Trash2, Pencil, Plus, Save,
  RefreshCw, LogOut, MessageSquare, CalendarDays, BarChart2,
  CheckCircle, XCircle, MessageCircle, ChevronDown, Zap, Palette, Sparkles, Droplets
} from 'lucide-react'
import {
  getBookings, getDashboardStats, getBarbersStatus, getBarbers,
  updateBookingStatus, deleteBooking, deleteBulkBookings,
  updateBarberAvailability, createBarber, updateBarber, deleteBarber,
  getServices, createService, updateService, deleteService, getReviews
} from '../utils/api'
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

const TABS = ['Booking', 'Barber', 'Layanan', 'Ulasan']

const EMPTY_BARBER = { name: '', startTime: '09:00', endTime: '21:00' }
const EMPTY_SERVICE = { name: '', description: '', duration: 30, price: 0, icon: 'scissors' }

const ICONS = ['scissors', 'beard', 'hair', 'razor', 'spray', 'color']
const ICON_COMPONENTS = {
  scissors: Scissors, beard: User, hair: Scissors,
  razor: Zap, spray: Droplets, color: Palette
}

function OwnerDashboard() {
  const [tab, setTab] = useState('Booking')
  const [bookings, setBookings] = useState([])
  const [barbers, setBarbers] = useState([])
  const [barbersFull, setBarbersFull] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, todayCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [search, setSearch] = useState('')

  // Barber form state
  const [barberForm, setBarberForm] = useState(EMPTY_BARBER)
  const [editingBarber, setEditingBarber] = useState(null)
  const [barberLoading, setBarberLoading] = useState(false)

  // Service form state
  const [services, setServices] = useState([])
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE)
  const [editingService, setEditingService] = useState(null)
  const [serviceLoading, setServiceLoading] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState([])

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [bookingsData, statsData, barbersData, barbersFullData, servicesData, reviewsData] = await Promise.all([
        getBookings(), getDashboardStats(), getBarbersStatus(), getBarbers(), getServices(true), getReviews()
      ])
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setStats(statsData)
      setBarbers(Array.isArray(barbersData) ? barbersData : [])
      setBarbersFull(Array.isArray(barbersFullData) ? barbersFullData : [])
      setServices(Array.isArray(servicesData) ? servicesData : [])
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  const refreshBookings = async () => {
    try {
      const [bookingsData, statsData] = await Promise.all([getBookings(), getDashboardStats()])
      setBookings(Array.isArray(bookingsData) ? bookingsData : [])
      setStats(statsData)
    } catch { toast.error('Gagal memperbarui data') }
  }

  const refreshBarbers = async () => {
    const [barbersData, barbersFullData] = await Promise.all([getBarbersStatus(), getBarbers()])
    setBarbers(Array.isArray(barbersData) ? barbersData : [])
    setBarbersFull(Array.isArray(barbersFullData) ? barbersFullData : [])
  }

  const handleUpdateStatus = async (id, status, name) => {
    const label = { completed: 'selesai', cancelled: 'dibatalkan' }
    if (!confirm(`Tandai booking ${name} sebagai ${label[status]}?`)) return
    try {
      await updateBookingStatus(id, status)
      toast.success(`Booking ${name} telah ${label[status]}`)
      refreshBookings()
    } catch { toast.error('Gagal mengupdate status') }
  }

  const handleDeleteBooking = async (id, name) => {
    if (!confirm(`Hapus booking ${name}?`)) return
    try {
      await deleteBooking(id)
      toast.success(`Booking ${name} berhasil dihapus`)
      refreshBookings()
    } catch { toast.error('Gagal menghapus booking') }
  }

  const handleDeleteCompleted = async () => {
    const count = bookings.filter(b => b.status === 'completed').length
    if (count === 0) { toast('Tidak ada booking selesai'); return }
    if (!confirm(`Hapus ${count} booking yang sudah selesai?`)) return
    try {
      await deleteBulkBookings('completed')
      toast.success(`${count} booking selesai dihapus`)
      refreshBookings()
    } catch { toast.error('Gagal menghapus') }
  }

  const handleDeleteAll = async () => {
    const count = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').length
    if (count === 0) { toast('Tidak ada riwayat yang bisa dihapus'); return }
    if (!confirm(`Hapus semua riwayat (${count} data)? Tidak bisa dibatalkan!`)) return
    try {
      await deleteBulkBookings()
      toast.success(`${count} riwayat berhasil dibersihkan`)
      refreshBookings()
    } catch { toast.error('Gagal membersihkan riwayat') }
  }

  const handleBarberAvailability = async (barberId, isAvailable, barberName) => {
    const statusText = isAvailable ? 'tersedia' : 'tidak tersedia'
    if (!confirm(`Ubah status ${barberName} menjadi ${statusText}?`)) return
    try {
      await updateBarberAvailability(barberId, isAvailable, isAvailable ? '' : 'Libur')
      toast.success(`Status ${barberName} sekarang ${statusText}`)
      refreshBarbers()
    } catch { toast.error('Gagal mengupdate status barber') }
  }

  const handleBarberSubmit = async (e) => {
    e.preventDefault()
    if (!barberForm.name.trim()) { toast.error('Nama barber wajib diisi'); return }
    setBarberLoading(true)
    try {
      if (editingBarber) {
        await updateBarber(editingBarber.id, barberForm)
        toast.success(`Barber ${barberForm.name} berhasil diupdate`)
      } else {
        await createBarber(barberForm)
        toast.success(`Barber ${barberForm.name} berhasil ditambahkan`)
      }
      setBarberForm(EMPTY_BARBER)
      setEditingBarber(null)
      refreshBarbers()
    } catch (err) { toast.error(err.message || 'Gagal menyimpan barber') }
    finally { setBarberLoading(false) }
  }

  const handleEditBarber = (barber) => {
    setEditingBarber(barber)
    setBarberForm({ name: barber.name, startTime: barber.start_time || '09:00', endTime: barber.end_time || '21:00' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteBarberAction = async (id, name) => {
    if (!confirm(`Hapus barber ${name}? Semua data terkait akan terpengaruh.`)) return
    try {
      await deleteBarber(id)
      toast.success(`Barber ${name} berhasil dihapus`)
      refreshBarbers()
    } catch (err) { toast.error(err.message || 'Gagal menghapus barber') }
  }

  const refreshServices = async () => {
    const data = await getServices(true)
    setServices(Array.isArray(data) ? data : [])
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    if (!serviceForm.name.trim()) { toast.error('Nama layanan wajib diisi'); return }
    setServiceLoading(true)
    try {
      if (editingService) {
        await updateService(editingService.id, serviceForm)
        toast.success(`Layanan ${serviceForm.name} berhasil diupdate`)
      } else {
        await createService(serviceForm)
        toast.success(`Layanan ${serviceForm.name} berhasil ditambahkan`)
      }
      setServiceForm(EMPTY_SERVICE)
      setEditingService(null)
      refreshServices()
    } catch (err) { toast.error(err.message || 'Gagal menyimpan layanan') }
    finally { setServiceLoading(false) }
  }

  const handleEditService = (svc) => {
    setEditingService(svc)
    setServiceForm({ name: svc.name, description: svc.description || '', duration: svc.duration, price: svc.price, icon: svc.icon || 'scissors' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteService = async (id, name) => {
    if (!confirm(`Hapus layanan ${name}?`)) return
    try {
      await deleteService(id)
      toast.success(`Layanan ${name} berhasil dihapus`)
      refreshServices()
    } catch (err) { toast.error(err.message || 'Gagal menghapus layanan') }
  }

  const handleLogout = () => { logout(); navigate('/manage-barbershop/login') }

  const filtered = bookings.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false
    if (filterDate && b.booking_date !== filterDate) return false
    if (search && !b.customer_name?.toLowerCase().includes(search.toLowerCase()) && !b.booking_code?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-light">Memuat dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <div className="bg-primary text-white px-4 sm:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Scissors size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base">{brand.name}</p>
            <p className="text-xs text-white/50 hidden sm:block">Owner Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60 hidden sm:block">{user?.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition">
            <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Total Booking', value: stats.total, color: 'text-gray-800' },
            { label: 'Menunggu', value: stats.pending, color: 'text-amber-500' },
            { label: 'Selesai', value: stats.completed, color: 'text-emerald-500' },
            { label: 'Hari Ini', value: stats.todayCount, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-xs text-text-light mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-1 sm:flex-none justify-center ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-text-light hover:text-primary'}`}>
              {t === 'Booking' && <CalendarDays size={14} />}
              {t === 'Barber' && <User size={14} />}
              {t === 'Layanan' && <Scissors size={14} />}
              {t === 'Ulasan' && <Star size={14} />}
              <span className="hidden xs:inline sm:inline">{t === 'Booking' ? 'Booking' : t === 'Barber' ? 'Barber' : t === 'Layanan' ? 'Layanan' : 'Ulasan'}</span>
            </button>
          ))}
        </div>

        {/* ===== TAB BOOKING ===== */}
        {tab === 'Booking' && (
          <>
            {/* Barbers Status */}
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-primary text-sm sm:text-base flex items-center gap-2"><User size={15} /> Status Barber</h2>
                <button onClick={fetchData} className="text-xs text-accent hover:underline font-medium flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {barbers.map(barber => (
                  <div key={barber.id} className="p-3 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm text-primary">{barber.name}</p>
                        <p className="text-xs text-text-light">{barber.today_bookings} booking hari ini</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        barber.status === 'available' ? 'bg-emerald-100 text-emerald-700'
                        : barber.status === 'busy' ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-600'
                      }`}>
                        {barber.status === 'available' ? <><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Available</> : barber.status === 'busy' ? <><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Busy</> : <><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Off</>}
                      </span>
                    </div>
                    {barber.status_note && <p className="text-xs text-text-light italic flex items-center gap-1"><MessageSquare size={11} /> {barber.status_note}</p>}
                    <select
                      value={barber.is_available ? 'available' : 'off'}
                      onChange={e => handleBarberAvailability(barber.id, e.target.value === 'available', barber.name)}
                      className="input text-xs py-2"
                    >
                      <option value="available">Tersedia</option>
                      <option value="off">Libur / Tidak Tersedia</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter & Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input type="text" placeholder="Cari nama / kode..." value={search} onChange={e => setSearch(e.target.value)} className="input text-sm flex-1" />
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="input text-sm w-full sm:w-40" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input text-sm w-full sm:w-40">
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleDeleteCompleted} className="px-3 py-2 bg-white border border-border text-text-light rounded-xl text-xs hover:bg-gray-50 transition font-medium whitespace-nowrap flex items-center gap-1"><Trash2 size={12} /> Hapus Selesai</button>
                <button onClick={handleDeleteAll} className="px-3 py-2 bg-red-50 border border-red-100 text-danger rounded-xl text-xs hover:bg-red-100 transition font-medium whitespace-nowrap flex items-center gap-1"><Trash2 size={12} /> Bersihkan</button>
              </div>
            </div>

            <p className="text-xs text-text-light mb-3">{filtered.length} booking ditemukan</p>

            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-border text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-text-light">Kode</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light">Customer</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light hidden sm:table-cell">Layanan</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light hidden md:table-cell">Barber</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light">Jadwal</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-text-light">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-12 text-text-light text-sm">Belum ada booking</td></tr>
                    ) : filtered.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50/70 transition">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-accent">{booking.booking_code}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-xs text-primary">{booking.customer_name}</p>
                          <p className="text-xs text-text-light">{booking.customer_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-light hidden sm:table-cell">{booking.service_name}</td>
                        <td className="px-4 py-3 text-xs text-text-light hidden md:table-cell">{booking.barber_name}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-primary">{booking.booking_date}</p>
                          <p className="text-xs text-text-light">{booking.time_slot} WIB</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[booking.status] || ''}`}>
                            {STATUS_LABELS[booking.status] || booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {booking.status === 'pending' && (
                              <>
                                <button onClick={() => handleUpdateStatus(booking.id, 'completed', booking.customer_name)} className="btn-success text-xs px-2.5 py-1 flex items-center gap-1"><CheckCircle size={12} /> Selesai</button>
                                <button onClick={() => handleUpdateStatus(booking.id, 'cancelled', booking.customer_name)} className="btn-danger text-xs px-2.5 py-1 flex items-center gap-1"><XCircle size={12} /> Batal</button>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button onClick={() => window.open(`https://wa.me/${booking.customer_phone}`, '_blank')} className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 transition flex items-center gap-1"><MessageCircle size={12} /> WA</button>
                            )}
                            <button onClick={() => handleDeleteBooking(booking.id, booking.customer_name)} className="px-2.5 py-1 bg-gray-100 text-text-light rounded-lg text-xs hover:bg-danger hover:text-white transition"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===== TAB BARBER ===== */}
        {tab === 'Barber' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Form Tambah/Edit */}
            <div className="card h-fit">
              <h2 className="font-semibold text-primary mb-4 text-sm flex items-center gap-2">
                {editingBarber ? <><Pencil size={14} /> Edit: {editingBarber.name}</> : <><Plus size={14} /> Tambah Barber</>}
              </h2>
              <form onSubmit={handleBarberSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-light mb-1 block">Nama Barber</label>
                  <input
                    type="text"
                    placeholder="Contoh: Andi Barber"
                    value={barberForm.name}
                    onChange={e => setBarberForm(f => ({ ...f, name: e.target.value }))}
                    className="input text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text-light mb-1 block flex items-center gap-1"><Clock size={11} /> Jam Mulai</label>
                    <select
                      value={barberForm.startTime}
                      onChange={e => setBarberForm(f => ({ ...f, startTime: e.target.value }))}
                      className="input text-sm"
                      required
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = String(Math.floor(i / 2)).padStart(2, '0')
                        const m = i % 2 === 0 ? '00' : '30'
                        const val = `${h}:${m}`
                        const ket = parseInt(h) < 12 ? 'Pagi' : parseInt(h) < 18 ? 'Siang' : 'Malam'
                        return <option key={val} value={val}>{val} ({ket})</option>
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-light mb-1 block flex items-center gap-1"><Clock size={11} /> Jam Selesai</label>
                    <select
                      value={barberForm.endTime}
                      onChange={e => setBarberForm(f => ({ ...f, endTime: e.target.value }))}
                      className="input text-sm"
                      required
                    >
                      {Array.from({ length: 48 }, (_, i) => {
                        const h = String(Math.floor(i / 2)).padStart(2, '0')
                        const m = i % 2 === 0 ? '00' : '30'
                        const val = `${h}:${m}`
                        const ket = parseInt(h) < 12 ? 'Pagi' : parseInt(h) < 18 ? 'Siang' : 'Malam'
                        return <option key={val} value={val}>{val} ({ket})</option>
                      })}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-text-light">
                  Slot tersedia: {barberForm.startTime} – {barberForm.endTime} (per 30 menit)
                </p>
                <div className="flex gap-2">
                  <button type="submit" disabled={barberLoading} className="btn-primary text-sm flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {barberLoading ? 'Menyimpan...' : editingBarber ? <><Save size={14} /> Simpan</> : <><Plus size={14} /> Tambah</>}
                  </button>
                  {editingBarber && (
                    <button type="button" onClick={() => { setEditingBarber(null); setBarberForm(EMPTY_BARBER) }}
                      className="px-4 py-2 bg-gray-100 text-text-light rounded-xl text-sm hover:bg-gray-200 transition">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Daftar Barber */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-primary text-sm">Daftar Barber ({barbersFull.length})</h2>
                <button onClick={refreshBarbers} className="text-xs text-accent hover:underline flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
              </div>
              {barbersFull.length === 0 ? (
                <div className="card text-center py-10 text-text-light text-sm">Belum ada barber</div>
              ) : barbersFull.map(barber => {
                const statusInfo = barbers.find(b => b.id === barber.id)
                return (
                  <div key={barber.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                          <Scissors size={18} />
                        </div>
                      <div>
                        <p className="font-semibold text-sm text-primary">{barber.name}</p>
                        <p className="text-xs text-text-light">
                          <Clock size={11} className="inline mr-0.5" /> {barber.start_time || '09:00'} – {barber.end_time || '21:00'}
                          {statusInfo && <span className="ml-2">· {statusInfo.today_bookings} booking hari ini</span>}
                        </p>
                        <p className="text-xs text-text-light flex items-center gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /> {barber.rating} · {barber.total_bookings} total booking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        barber.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${barber.is_available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {barber.is_available ? 'Aktif' : 'Libur'}
                      </span>
                      <button onClick={() => handleEditBarber(barber)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition font-medium flex items-center gap-1">
                        <Pencil size={12} /> Edit
                      </button>
                      <button onClick={() => handleDeleteBarberAction(barber.id, barber.name)}
                        className="px-3 py-1.5 bg-red-50 text-danger rounded-lg text-xs hover:bg-red-100 transition font-medium flex items-center gap-1">
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== TAB LAYANAN ===== */}
        {tab === 'Layanan' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card h-fit">
              <h2 className="font-semibold text-primary mb-4 text-sm flex items-center gap-2">
                {editingService ? <><Pencil size={14} /> Edit: {editingService.name}</> : <><Plus size={14} /> Tambah Layanan</>}
              </h2>
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-text-light mb-1 block">Nama Layanan</label>
                  <input type="text" placeholder="Contoh: Potong Rambut"
                    value={serviceForm.name}
                    onChange={e => setServiceForm(f => ({ ...f, name: e.target.value }))}
                    className="input text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-light mb-1 block">Deskripsi</label>
                  <input type="text" placeholder="Deskripsi singkat..."
                    value={serviceForm.description}
                    onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                    className="input text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-text-light mb-1 block flex items-center gap-1"><Clock size={11} /> Durasi (menit)</label>
                    <input type="number" min="5" max="240" step="5"
                      value={serviceForm.duration}
                      onChange={e => setServiceForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                      className="input text-sm" required />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-light mb-1 block">Harga (Rp)</label>
                    <input type="number" min="0" step="1000"
                      value={serviceForm.price}
                      onChange={e => setServiceForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                      className="input text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-light mb-1 block">Ikon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICONS.map(ic => {
                      const IconComp = ICON_COMPONENTS[ic] || Scissors
                      return (
                        <button key={ic} type="button"
                          onClick={() => setServiceForm(f => ({ ...f, icon: ic }))}
                          className={`p-2 rounded-lg border-2 transition flex items-center justify-center ${
                            serviceForm.icon === ic ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-accent/40 text-gray-400'
                          }`}>
                          <IconComp size={16} />
                        </button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-xs text-text-light">Slot per booking: {serviceForm.duration} menit</p>
                <div className="flex gap-2">
                  <button type="submit" disabled={serviceLoading} className="btn-primary text-sm flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {serviceLoading ? 'Menyimpan...' : editingService ? <><Save size={14} /> Simpan</> : <><Plus size={14} /> Tambah</>}
                  </button>
                  {editingService && (
                    <button type="button" onClick={() => { setEditingService(null); setServiceForm(EMPTY_SERVICE) }}
                      className="px-4 py-2 bg-gray-100 text-text-light rounded-xl text-sm hover:bg-gray-200 transition">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-primary text-sm">Daftar Layanan ({services.length})</h2>
                <button onClick={refreshServices} className="text-xs text-accent hover:underline flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
              </div>
              {services.length === 0 ? (
                <div className="card text-center py-10 text-text-light text-sm">Belum ada layanan</div>
              ) : services.map(svc => (
                <div key={svc.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      {(() => { const IC = ICON_COMPONENTS[svc.icon] || Scissors; return <IC size={18} /> })()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-primary">{svc.name}</p>
                      <p className="text-xs text-text-light">{svc.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={10} /> {svc.duration} menit</span>
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">Rp {parseInt(svc.price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditService(svc)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition font-medium flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDeleteService(svc.id, svc.name)}
                      className="px-3 py-1.5 bg-red-50 text-danger rounded-lg text-xs hover:bg-red-100 transition font-medium flex items-center gap-1">
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB ULASAN ===== */}
        {tab === 'Ulasan' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-primary text-sm">Ulasan Customer ({reviews.length})</h2>
                {reviews.length > 0 && (
                  <p className="text-xs text-text-light mt-0.5">
                    Rata-rata: {'★'.repeat(Math.round(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length))}
                    {' '}{(reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1)} / 5
                  </p>
                )}
              </div>
              <button onClick={async () => { const d = await getReviews(); setReviews(Array.isArray(d) ? d : []) }}
                className="text-xs text-accent hover:underline flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
            </div>
            {reviews.length === 0 ? (
              <div className="card text-center py-12 text-text-light text-sm">Belum ada ulasan</div>
            ) : reviews.map(r => (
              <div key={r.id} className="card">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <User size={18} />
                      </div>
                    <div>
                      <p className="font-semibold text-sm text-primary">{r.customer_name}</p>
                      <p className="text-xs text-text-light">{r.service_name} · {r.barber_name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex gap-0.5 justify-end">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`text-base ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-text-light mt-0.5">{r.created_at?.split('T')[0]}</p>
                  </div>
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 italic">"{r.comment}"</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default OwnerDashboard

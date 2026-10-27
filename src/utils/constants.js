export const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

export const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export const STATUS_LABELS = {
  pending: 'Menunggu',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

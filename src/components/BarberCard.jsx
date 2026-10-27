import { Scissors, Star, Check, Clock } from 'lucide-react'

function formatJam(time) {
  if (!time) return '-'
  const [h] = time.split(':').map(Number)
  return `${time} ${h < 12 ? 'Pagi' : h < 18 ? 'Siang' : 'Malam'}`
}

function BarberCard({ barber, isSelected, onSelect }) {
  const start = barber.start_time
  const end = barber.end_time
  return (
    <div
      onClick={() => onSelect(barber)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border hover:border-accent/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'}`}>
            <Scissors size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm text-primary">{barber.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium">{barber.rating}</span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-text-light">{barber.total_bookings} booking</span>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-text-light flex items-center gap-1 justify-end"><Clock size={11} /> {formatJam(start)} – {formatJam(end)}</p>
          {isSelected && <p className="text-xs text-accent mt-0.5 flex items-center justify-end gap-0.5"><Check size={11} /> Dipilih</p>}
        </div>
      </div>
    </div>
  )
}

export default BarberCard

import { Scissors, Palette, User, Sparkles, Droplets, Check, Clock, Zap } from 'lucide-react'

const ICON_MAP = {
  scissors: Scissors,
  razor: Zap,
  palette: Palette,
  beard: User,
  spa: Sparkles,
  spray: Droplets,
  hair: Scissors,
  color: Palette,
}

function ServiceCard({ service, isSelected, onSelect }) {
  const IconComp = ICON_MAP[service.icon] || Scissors

  return (
    <div
      onClick={() => onSelect(service)}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border hover:border-accent/40 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-accent/10 text-accent' : 'bg-gray-100 text-gray-500'}`}>
            <IconComp size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm text-primary">{service.name}</p>
            <p className="text-xs text-text-light mt-0.5">{service.description}</p>
            <p className="text-xs text-text-light mt-0.5 flex items-center gap-1"><Clock size={11} /> {service.duration} menit</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-accent text-sm">Rp {service.price.toLocaleString('id-ID')}</p>
          {isSelected && <p className="text-xs text-accent mt-0.5 flex items-center justify-end gap-0.5"><Check size={11} /> Dipilih</p>}
        </div>
      </div>
    </div>
  )
}

export default ServiceCard

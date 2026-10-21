import { useLayoutEffect, useRef } from 'react'
import { statusLabel } from '../statusLabels'

const statuses = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']

export default function FilterChips({ filter, counts, totalCount, onSelect }) {
  const trackRef = useRef(null)

  // Posiciona o indicador deslizante atrás do chip ativo e o traz para a área visível.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const place = (smooth) => {
      const active = track.querySelector('[aria-pressed="true"]')
      if (!active) return
      track.style.setProperty('--chip-x', `${active.offsetLeft}px`)
      track.style.setProperty('--chip-w', `${active.offsetWidth}px`)
      track.dataset.ready = 'true'
      const target = active.offsetLeft - (track.clientWidth - active.offsetWidth) / 2
      if (track.scrollWidth > track.clientWidth) {
        track.scrollTo({ left: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' })
      }
    }

    place(false)
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => place(false))
    observer.observe(track)
    return () => observer.disconnect()
  }, [filter, counts, totalCount])

  const chips = [
    { key: 'TODOS', label: 'Todos', count: totalCount },
    ...statuses.map((status) => ({
      key: status,
      label: statusLabel[status],
      count: counts[status] || 0,
    })),
  ]

  return (
    <div className="filters" role="group" aria-label="Filtrar pedidos" ref={trackRef}>
      <span className="filters-indicator" aria-hidden="true" />
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className={`chip${filter === chip.key ? ' active' : ''}`}
          aria-pressed={filter === chip.key}
          onClick={() => onSelect(chip.key)}
        >
          {chip.label} <span>{chip.count}</span>
        </button>
      ))}
    </div>
  )
}

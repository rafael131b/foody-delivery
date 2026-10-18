import { statusLabel, StatusBadge } from './Brand'

export default function OrderCard({ order, onStatusChange }) {
  const items = order.items.split('\n').join(' · ')
  const date = order.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(order.createdAt))
    : 'Agora mesmo'

  return (
    <article className="order-card">
      <div className="order-card-head">
        <div className="order-number">Pedido <strong>#{String(order.id).padStart(4, '0')}</strong></div>
        <StatusBadge status={order.status} />
      </div>
      <div className="order-main">
        <div className="order-customer"><span className="detail-label">Cliente</span><h3>{order.customer}</h3></div>
        <div className="order-detail"><span className="detail-label">Endereço de entrega</span><span>{order.deliveryAddress}{order.complement ? ` · ${order.complement}` : ''}</span></div>
        <div className="order-detail"><span className="detail-label">Itens do pedido</span><span>{items || '—'}</span></div>
      </div>
      <div className="order-card-foot">
        <span className="order-date">Criado em {date}</span>
        {order.allowedNextStatuses.length > 0 && (
          <label className="status-control">Atualizar etapa
            <select aria-label={`Atualizar status do pedido ${order.id}`} value={order.status} onChange={event => onStatusChange(order.id, event.target.value)}>
              {[order.status, ...order.allowedNextStatuses].map(status => (
                <option key={status} value={status}>{statusLabel[status]}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </article>
  )
}

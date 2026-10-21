import { StatusBadge } from './Brand'
import { Icon } from './Illustrations'
import { statusLabel } from '../statusLabels'

const flow = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE']

function Tracker({ status }) {
  const cancelled = status === 'CANCELADO'
  const current = flow.indexOf(status)
  const label = cancelled
    ? 'Pedido cancelado'
    : `Etapa ${Math.max(current, 0) + 1} de ${flow.length}`

  return (
    <div
      className={`tracker${cancelled ? ' is-cancelled' : ''}`}
      style={{ '--step': Math.max(current, 0) }}
      role="img"
      aria-label={label}
    >
      <span className="tracker-fill" />
      {flow.map((step, index) => (
        <i
          key={step}
          className={index < current ? 'is-done' : index === current ? 'is-done is-current' : ''}
          title={statusLabel[step]}
        />
      ))}
    </div>
  )
}

export default function OrderCard({ order, onStatusChange, index = 0 }) {
  const items = (order.items || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
  const allowedNextStatuses = Array.isArray(order.allowedNextStatuses)
    ? order.allowedNextStatuses
    : []
  const parsedDate = order.createdAt ? new Date(order.createdAt) : null
  const date =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
          parsedDate,
        )
      : 'Agora mesmo'

  return (
    <article className="order-card" style={{ '--i': index }}>
      <div className="order-card-head">
        <div className="order-number">
          Pedido <strong>#{String(order.id).padStart(4, '0')}</strong>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <Tracker status={order.status} />
      <div className="order-customer">
        <span className="detail-label">Cliente</span>
        <h3>{order.customer}</h3>
      </div>
      <div className="order-main">
        <div className="order-detail">
          <span className="detail-icon">
            <Icon name="pin" />
          </span>
          <div>
            <span className="detail-label">Endereço de entrega</span>
            <span className="detail-value">
              {order.deliveryAddress}
              {order.complement ? ` · ${order.complement}` : ''}
            </span>
          </div>
        </div>
        <div className="order-detail">
          <span className="detail-icon">
            <Icon name="bag" />
          </span>
          <div>
            <span className="detail-label">Itens do pedido</span>
            {items.length > 0 ? (
              <ul className="item-list">
                {items.map((item, itemIndex) => (
                  <li key={`${itemIndex}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <span className="detail-value">—</span>
            )}
          </div>
        </div>
      </div>
      <div className="order-card-foot">
        <span className="order-date">
          <Icon name="clock" /> Criado em {date}
        </span>
        {allowedNextStatuses.length > 0 && (
          <label className="status-control">
            Atualizar etapa
            <select
              aria-label={`Atualizar status do pedido ${order.id}`}
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
            >
              {[order.status, ...allowedNextStatuses].map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </article>
  )
}

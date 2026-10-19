import { useState } from 'react'
import { Shell } from '../components/Brand'
import OrderCard from '../components/OrderCard'
import OrderForm from '../components/OrderForm'
import useOrders from '../hooks/useOrders'
import { statusLabel } from '../statusLabels'

const statuses = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']

export default function OrdersPage({ user, token, onLogout }) {
  const [showForm, setShowForm] = useState(false)
  const {
    orders,
    pageInfo,
    counts,
    totalCount,
    filter,
    error,
    loading,
    selectFilter,
    goToPage,
    refresh,
    updateStatus,
  } = useOrders(token)

  return (
    <Shell user={user} onLogout={onLogout}>
      <main className="dashboard">
        <section className="dashboard-heading">
          <div>
            <p className="brand-kicker">Operação de entregas</p>
            <h1>Pedidos</h1>
            <p className="dashboard-subtitle">
              Acompanhe cada pedido e atualize a etapa da entrega.
            </p>
          </div>
          <button
            className="button button-primary new-order-button"
            onClick={() => setShowForm(true)}
          >
            ＋ Novo pedido
          </button>
        </section>

        <section className="summary-strip" aria-label="Resumo dos pedidos">
          <div className="summary-item summary-total">
            <span>Total de pedidos</span>
            <strong>{totalCount}</strong>
          </div>
          <div className="summary-item">
            <span>Recebidos</span>
            <strong>{counts.RECEBIDO || 0}</strong>
          </div>
          <div className="summary-item">
            <span>Em preparo</span>
            <strong>{counts.EM_PREPARO || 0}</strong>
          </div>
          <div className="summary-item">
            <span>Em entrega</span>
            <strong>{counts.SAIU_PARA_ENTREGA || 0}</strong>
          </div>
          <div className="summary-item">
            <span>Concluídos</span>
            <strong>{counts.ENTREGUE || 0}</strong>
          </div>
        </section>

        {showForm && (
          <OrderForm
            token={token}
            onCreated={() => {
              setShowForm(false)
              selectFilter('TODOS')
              refresh()
            }}
            onCancel={() => setShowForm(false)}
          />
        )}
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}

        <section className="orders-section">
          <div className="orders-section-heading">
            <div>
              <h2>Lista de pedidos</h2>
              <span>
                {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
          </div>
          <div className="filters" role="group" aria-label="Filtrar pedidos">
            <button
              className={filter === 'TODOS' ? 'active' : ''}
              onClick={() => selectFilter('TODOS')}
            >
              Todos <span>{totalCount}</span>
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                className={filter === status ? 'active' : ''}
                onClick={() => selectFilter(status)}
              >
                {statusLabel[status]} <span>{counts[status] || 0}</span>
              </button>
            ))}
          </div>
          <div className="orders-list">
            {loading ? (
              <div className="empty-state" role="status">
                Carregando pedidos...
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-route" aria-hidden="true">
                  <span />
                  <i />
                  <span />
                  <i />
                  <span />
                </div>
                <h3>
                  {filter !== 'TODOS' ? 'Nenhum pedido nesta etapa' : 'Nenhum pedido por enquanto'}
                </h3>
                <p>
                  {filter !== 'TODOS'
                    ? 'Escolha outra etapa para ver os pedidos.'
                    : 'Cadastre um pedido para começar a acompanhar a operação.'}
                </p>
                {filter === 'TODOS' && (
                  <button className="button button-primary" onClick={() => setShowForm(true)}>
                    ＋ Novo pedido
                  </button>
                )}
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} onStatusChange={updateStatus} />
              ))
            )}
          </div>
          {!loading && pageInfo.totalPages > 0 && (
            <nav className="pagination" aria-label="Paginação de pedidos">
              <span>
                Mostrando {pageInfo.page * pageInfo.size + 1}–
                {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} de{' '}
                {pageInfo.totalElements}
              </span>
              <div>
                <button
                  className="button button-secondary"
                  onClick={() => goToPage(pageInfo.page - 1)}
                  disabled={pageInfo.first}
                >
                  Anterior
                </button>
                <span className="pagination-page">
                  Página {pageInfo.page + 1} de {pageInfo.totalPages}
                </span>
                <button
                  className="button button-secondary"
                  onClick={() => goToPage(pageInfo.page + 1)}
                  disabled={pageInfo.last}
                >
                  Próxima
                </button>
              </div>
            </nav>
          )}
        </section>
      </main>
    </Shell>
  )
}

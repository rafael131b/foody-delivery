import { useState } from 'react'
import { Shell } from '../components/Brand'
import FilterChips from '../components/FilterChips'
import { EmptyBag, Icon, RiderScene } from '../components/Illustrations'
import OrderCard from '../components/OrderCard'
import OrderForm from '../components/OrderForm'
import OrderSkeleton from '../components/OrderSkeleton'
import useOrders from '../hooks/useOrders'

function SummaryCard({ tone, icon, label, value, index }) {
  return (
    <div className={`step-card step-${tone}`} style={{ '--i': index }}>
      <span className="step-icon">
        <Icon name={icon} />
      </span>
      <span className="step-label">{label}</span>
      {/* A chave reinicia a animação quando o contador muda. */}
      <strong key={value} className="step-count">
        {value}
      </strong>
    </div>
  )
}

export default function OrdersPage({ user, token, onLogout }) {
  const [showForm, setShowForm] = useState(false)
  const {
    orders,
    pageInfo,
    counts,
    totalCount,
    filter,
    search,
    error,
    loading,
    selectFilter,
    selectSearch,
    goToPage,
    refresh,
    updateStatus,
  } = useOrders(token)

  const inDelivery = counts.SAIU_PARA_ENTREGA || 0
  const refreshing = loading && orders.length > 0

  return (
    <Shell user={user} onLogout={onLogout}>
      <main className="dashboard">
        <section className="hero" id="topo">
          <span className="deco-cross cross-a" aria-hidden="true" />
          <span className="deco-cross cross-b" aria-hidden="true" />
          <div className="hero-copy">
            <p className="brand-kicker">Operação de entregas</p>
            <h1>Pedidos</h1>
            <p className="dashboard-subtitle">
              Acompanhe cada pedido e atualize a etapa da entrega.
            </p>
            <div className="hero-actions">
              <button
                className="button button-primary new-order-button"
                onClick={() => setShowForm(true)}
              >
                ＋ Novo pedido
              </button>
              <a className="link-arrow" href="#lista">
                Ver a lista <Icon name="arrowRight" />
              </a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <RiderScene />
            <div className="hero-tag">
              <span className="hero-tag-dot" />
              <span>
                <strong>{inDelivery}</strong> {inDelivery === 1 ? 'pedido' : 'pedidos'} a caminho
              </span>
            </div>
          </div>
        </section>

        <section className="summary-strip" id="resumo" aria-label="Resumo dos pedidos">
          <SummaryCard
            tone="total"
            icon="receipt"
            label="Total de pedidos"
            value={totalCount}
            index={0}
          />
          <SummaryCard
            tone="recebido"
            icon="inbox"
            label="Recebidos"
            value={counts.RECEBIDO || 0}
            index={1}
          />
          <SummaryCard
            tone="preparo"
            icon="pot"
            label="Em preparo"
            value={counts.EM_PREPARO || 0}
            index={2}
          />
          <SummaryCard
            tone="entrega"
            icon="scooter"
            label="Em entrega"
            value={inDelivery}
            index={3}
          />
          <SummaryCard
            tone="entregue"
            icon="check"
            label="Concluídos"
            value={counts.ENTREGUE || 0}
            index={4}
          />
        </section>

        {showForm && (
          <OrderForm
            token={token}
            onCreated={() => {
              setShowForm(false)
              selectSearch('')
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

        <section className="orders-section" id="lista">
          <div className="orders-toolbar">
            <div className={`orders-search${search ? ' has-value' : ''}`}>
              <span className="orders-search-icon" aria-hidden="true">
                <Icon name="search" />
              </span>
              <input
                type="search"
                aria-label="Buscar pedidos"
                placeholder="Buscar por nº ou nome do cliente"
                value={search}
                onChange={(event) => selectSearch(event.target.value)}
              />
              <button
                type="button"
                className="orders-search-clear"
                aria-label="Limpar busca"
                tabIndex={search ? 0 : -1}
                disabled={!search}
                onClick={() => selectSearch('')}
              >
                <Icon name="close" />
              </button>
            </div>
            <span className="orders-count">
              {pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          <FilterChips
            filter={filter}
            counts={counts}
            totalCount={totalCount}
            onSelect={selectFilter}
          />
          <p className="sr-only" role="status">
            {loading ? 'Carregando pedidos...' : ''}
          </p>
          <div className={`orders-list${refreshing ? ' is-refreshing' : ''}`} aria-busy={loading}>
            {refreshing && <span className="orders-progress" aria-hidden="true" />}
            {loading && orders.length === 0 ? (
              <OrderSkeleton />
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <EmptyBag />
                <h3>
                  {search.trim()
                    ? 'Nenhum pedido encontrado'
                    : filter !== 'TODOS'
                      ? 'Nenhum pedido nesta etapa'
                      : 'Nenhum pedido por enquanto'}
                </h3>
                <p>
                  {search.trim()
                    ? 'Tente outro número ou nome de cliente.'
                    : filter !== 'TODOS'
                      ? 'Escolha outra etapa para ver os pedidos.'
                      : 'Cadastre um pedido para começar a acompanhar a operação.'}
                </p>
                {filter === 'TODOS' && !search.trim() && (
                  <button className="button button-primary" onClick={() => setShowForm(true)}>
                    ＋ Novo pedido
                  </button>
                )}
              </div>
            ) : (
              orders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  onStatusChange={updateStatus}
                />
              ))
            )}
          </div>
          {!loading && pageInfo.totalPages > 0 && (
            <nav className="pagination" aria-label="Paginação de pedidos">
              <span className="pagination-info">
                Mostrando {pageInfo.page * pageInfo.size + 1}–
                {Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} de{' '}
                {pageInfo.totalElements}
              </span>
              <div className="pagination-controls">
                <button
                  className="button button-secondary"
                  onClick={() => goToPage(pageInfo.page - 1)}
                  disabled={pageInfo.first}
                >
                  <Icon name="arrowLeft" /> Anterior
                </button>
                <span className="pagination-page">
                  Página {pageInfo.page + 1} de {pageInfo.totalPages}
                </span>
                <button
                  className="button button-secondary"
                  onClick={() => goToPage(pageInfo.page + 1)}
                  disabled={pageInfo.last}
                >
                  Próxima <Icon name="arrowRight" />
                </button>
              </div>
            </nav>
          )}
        </section>
      </main>
    </Shell>
  )
}

import { useEffect, useState } from 'react'
import { api } from '../api'
import { Shell, statusLabel } from '../components/Brand'
import OrderCard from '../components/OrderCard'
import OrderForm from '../components/OrderForm'

const statuses = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']
const pageSize = 10

export default function OrdersPage({ user, onLogout }) {
  const [orders, setOrders] = useState([])
  const [pageInfo, setPageInfo] = useState({ page: 0, size: pageSize, totalElements: 0, totalPages: 0, first: true, last: true })
  const [counts, setCounts] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('TODOS')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const load = async (requestedPage = pageInfo.page, requestedFilter = filter) => {
    setLoading(true)
    try {
      const result = await api.orders({ page: requestedPage, size: pageSize, status: requestedFilter })
      if (!result || !Array.isArray(result.content) || !result.statusCounts) {
        throw new Error('Recebemos uma resposta inesperada. Atualize a página e tente novamente.')
      }
      setOrders(result.content)
      setPageInfo(result)
      setCounts(result.statusCounts)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0, 'TODOS') }, [])

  const changeFilter = nextFilter => {
    setFilter(nextFilter)
    setPageInfo(current => ({ ...current, page: 0 }))
    load(0, nextFilter)
  }

  const changePage = nextPage => {
    setPageInfo(current => ({ ...current, page: nextPage }))
    load(nextPage, filter)
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateStatus(id, status)
      await load()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <Shell user={user} onLogout={onLogout}>
      <main className="dashboard">
        <section className="dashboard-heading">
          <div>
            <p className="brand-kicker">Operação de entregas</p>
            <h1>Pedidos</h1>
            <p className="dashboard-subtitle">Acompanhe cada pedido e atualize a etapa da entrega.</p>
          </div>
          <button className="button button-primary new-order-button" onClick={() => setShowForm(true)}>＋ Novo pedido</button>
        </section>

        <section className="summary-strip" aria-label="Resumo dos pedidos">
          <div className="summary-item summary-total"><span>Total de pedidos</span><strong>{totalCount}</strong></div>
          <div className="summary-item"><span>Recebidos</span><strong>{counts.RECEBIDO || 0}</strong></div>
          <div className="summary-item"><span>Em preparo</span><strong>{counts.EM_PREPARO || 0}</strong></div>
          <div className="summary-item"><span>Em entrega</span><strong>{counts.SAIU_PARA_ENTREGA || 0}</strong></div>
          <div className="summary-item"><span>Concluídos</span><strong>{counts.ENTREGUE || 0}</strong></div>
        </section>

        {showForm && <OrderForm onCreated={() => { setShowForm(false); changeFilter('TODOS') }} onCancel={() => setShowForm(false)} />}
        {error && <div className="alert" role="alert">{error}</div>}

        <section className="orders-section">
          <div className="orders-section-heading">
            <div><h2>Lista de pedidos</h2><span>{pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'pedido' : 'pedidos'}</span></div>
          </div>
          <div className="filters" role="group" aria-label="Filtrar pedidos">
            <button className={filter === 'TODOS' ? 'active' : ''} onClick={() => changeFilter('TODOS')}>Todos <span>{totalCount}</span></button>
            {statuses.map(status => (
              <button key={status} className={filter === status ? 'active' : ''} onClick={() => changeFilter(status)}>
                {statusLabel[status]} <span>{counts[status] || 0}</span>
              </button>
            ))}
          </div>
          <div className="orders-list">
            {loading ? <div className="empty-state" role="status">Carregando pedidos...</div> : orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-route" aria-hidden="true"><span /><i /><span /><i /><span /></div>
                <h3>{filter !== 'TODOS' ? 'Nenhum pedido nesta etapa' : 'Nenhum pedido por enquanto'}</h3>
                <p>{filter !== 'TODOS' ? 'Escolha outra etapa para ver os pedidos.' : 'Cadastre um pedido para começar a acompanhar a operação.'}</p>
                {filter === 'TODOS' && <button className="button button-primary" onClick={() => setShowForm(true)}>＋ Novo pedido</button>}
              </div>
            ) : orders.map(order => <OrderCard key={order.id} order={order} onStatusChange={updateStatus} />)}
          </div>
          {!loading && pageInfo.totalPages > 0 && (
            <nav className="pagination" aria-label="Paginação de pedidos">
              <span>Mostrando {pageInfo.page * pageInfo.size + 1}–{Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} de {pageInfo.totalElements}</span>
              <div>
                <button className="button button-secondary" onClick={() => changePage(pageInfo.page - 1)} disabled={pageInfo.first}>Anterior</button>
                <span className="pagination-page">Página {pageInfo.page + 1} de {pageInfo.totalPages}</span>
                <button className="button button-secondary" onClick={() => changePage(pageInfo.page + 1)} disabled={pageInfo.last}>Próxima</button>
              </div>
            </nav>
          )}
        </section>
      </main>
    </Shell>
  )
}

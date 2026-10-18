import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { api } from './api'
import './foody-brand.css'

const statuses = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO']
const statusLabel = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}
const emptyOrder = { customer: '', address: '', complement: '', items: '' }

function Logo() {
  return <img className="foody-logo" src="/foody-logo.png" alt="Foody Delivery" />
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{statusLabel[status] || status}</span>
}

function Shell({ children, user, onLogout }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <span className="workspace-title">Central de pedidos</span>
        <div className="topbar-right">
          <span className="user-greeting">Olá, {user?.name || 'cliente'}</span>
          <button className="button button-logout" onClick={onLogout}>Sair</button>
        </div>
      </header>
      {children}
      <footer className="app-footer">Foody Delivery <span>•</span> Operação de entregas</footer>
    </div>
  )
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form)
      localStorage.setItem('foody_token', result.token)
      onAuth(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Foody Delivery">
        <div className="auth-brand"><Logo /><span>Gestão de entregas</span></div>
        <div className="auth-message">
          <p className="brand-kicker">FOODY DELIVERY</p>
          <h1>Pedidos em movimento.<br /><span>Entrega sob controle.</span></h1>
          <p className="auth-description">Acompanhe cada etapa da operação em um painel simples e organizado.</p>
        </div>
        <div className="route-preview" aria-hidden="true">
          <div className="route-stops"><i /><i /><i /></div>
          <div className="route-labels"><span>Recebido</span><span>Em rota</span><span>Entregue</span></div>
          <div className="route-caption"><span className="route-dot" /> Fluxo de entrega</div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand"><Logo /></div>
          <p className="auth-overline">Acesso à operação</p>
          <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>
          <p className="auth-intro">
            {mode === 'login' ? 'Acesse seu painel para acompanhar os pedidos.' : 'Cadastre-se para começar a organizar as entregas.'}
          </p>
          {error && <div className="alert" role="alert">{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label>Nome completo
                <input required maxLength="120" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Como podemos te chamar?" />
              </label>
            )}
            <label>E-mail
              <input required maxLength="254" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="voce@email.com" />
            </label>
            <label>Senha
              <input required minLength="8" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo de 8 caracteres" />
            </label>
            <button className="button button-primary button-full" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
          <p className="switch-auth">
            {mode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function OrderForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(emptyOrder)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const items = form.items.split('\n').map(item => item.trim()).filter(Boolean).join('\n')
      await api.createOrder({ customer: form.customer, deliveryAddress: form.address, complement: form.complement, items })
      setForm(emptyOrder)
      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-card">
      <div className="section-heading">
        <div><p className="brand-kicker">Novo pedido</p><h2>Dados da entrega</h2></div>
        <button className="icon-button" onClick={onCancel} aria-label="Fechar formulário">×</button>
      </div>
      {error && <div className="alert" role="alert">{error}</div>}
      <form className="order-form" onSubmit={submit}>
        <label>Nome do cliente
          <input required maxLength="120" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="Ex.: Ana Souza" />
        </label>
        <label>Endereço de entrega
          <textarea required maxLength="500" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, complemento e bairro" />
        </label>
        <label>Complemento <span className="field-hint">opcional</span>
          <input maxLength="200" value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })} placeholder="Ex.: apartamento, bloco ou referência" />
        </label>
        <label>Itens do pedido <span className="field-hint">um item por linha</span>
          <textarea required maxLength="2000" rows="3" value={form.items} onChange={e => setForm({ ...form, items: e.target.value })} placeholder={'1x Smash Foody\n1x Batata crocante'} />
        </label>
        <div className="form-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>Cancelar</button>
          <button className="button button-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar pedido'}</button>
        </div>
      </form>
    </section>
  )
}

function OrderCard({ order, onStatusChange }) {
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
        {order.status !== 'ENTREGUE' && order.status !== 'CANCELADO' && (
          <label className="status-control">Atualizar etapa
            <select aria-label={`Atualizar status do pedido ${order.id}`} value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}>
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

function Orders({ user, onLogout }) {
  const [orders, setOrders] = useState([])
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true })
  const [counts, setCounts] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('TODOS')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const pageSize = 10
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const load = async (requestedPage = pageInfo.page, requestedFilter = filter) => {
    setLoading(true)
    try {
      const result = await api.orders({ page: requestedPage, size: pageSize, status: requestedFilter })
      setOrders(result.content)
      setPageInfo(result)
      setCounts(result.statusCounts || {})
      setError('')
    } catch (err) {
      setError(err.message)
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

  const update = async (id, status) => {
    try {
      await api.updateStatus(id, status)
      await load()
    } catch (err) {
      setError(err.message)
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
          <div className="orders-section-heading"><div><h2>Lista de pedidos</h2><span>{pageInfo.totalElements} {pageInfo.totalElements === 1 ? 'pedido' : 'pedidos'}</span></div></div>
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
            ) : orders.map(order => <OrderCard key={order.id} order={order} onStatusChange={update} />)}
          </div>
          {!loading && pageInfo.totalPages > 0 && <nav className="pagination" aria-label="Paginação de pedidos">
            <span>Mostrando {pageInfo.page * pageInfo.size + 1}–{Math.min((pageInfo.page + 1) * pageInfo.size, pageInfo.totalElements)} de {pageInfo.totalElements}</span>
            <div>
              <button className="button button-secondary" onClick={() => changePage(pageInfo.page - 1)} disabled={pageInfo.first}>Anterior</button>
              <span className="pagination-page">Página {pageInfo.page + 1} de {pageInfo.totalPages}</span>
              <button className="button button-secondary" onClick={() => changePage(pageInfo.page + 1)} disabled={pageInfo.last}>Próxima</button>
            </div>
          </nav>}
        </section>
      </main>
    </Shell>
  )
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foody_user')) } catch { return null }
  })
  const auth = value => {
    localStorage.setItem('foody_user', JSON.stringify(value))
    setUser(value)
  }
  const logout = () => {
    localStorage.removeItem('foody_token')
    localStorage.removeItem('foody_user')
    setUser(null)
  }
  return user ? <Orders user={user} onLogout={logout} /> : <Auth onAuth={auth} />
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)

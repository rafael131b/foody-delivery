export const statusLabel = {
  RECEBIDO: 'Recebido',
  EM_PREPARO: 'Em preparo',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export function Logo() {
  return <img className="foody-logo" src="/foody-logo.png" alt="Foody Delivery" />
}

export function StatusBadge({ status }) {
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{statusLabel[status] || status}</span>
}

export function Shell({ children, user, onLogout }) {
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

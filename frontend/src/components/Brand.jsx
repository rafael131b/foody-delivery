import { useEffect, useState } from 'react'
import { statusLabel } from '../statusLabels'
import { Icon } from './Illustrations'

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M8 4v6a2.5 2.5 0 0 0 5 0V4M10.5 4v16" strokeLinecap="round" />
        <path d="M17 4c-2.4 1.8-2.4 7 0 9v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

export function Logo({ className = '' }) {
  return (
    <span className={`foody-logo ${className}`.trim()}>
      <LogoMark />
      <span className="logo-word">
        Foody <span>Delivery</span>
      </span>
    </span>
  )
}

export function StatusBadge({ status }) {
  // A troca de etapa remonta o selo para repetir a animação de "pop" apenas quando muda.
  const [shown, setShown] = useState(status)
  const [changed, setChanged] = useState(false)
  if (shown !== status) {
    setShown(status)
    setChanged(true)
  }

  return (
    <span
      key={status}
      className={`status-badge status-${status?.toLowerCase()}${changed ? ' is-changed' : ''}`}
    >
      <i aria-hidden="true" />
      {statusLabel[status] || status}
    </span>
  )
}

const navItems = [
  { id: 'topo', label: 'Início' },
  { id: 'resumo', label: 'Resumo' },
  { id: 'lista', label: 'Pedidos' },
]

function useActiveSection() {
  const [active, setActive] = useState('topo')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    navItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])

  return active
}

export function Shell({ children, user, onLogout }) {
  const active = useActiveSection()
  const name = user?.name || 'cliente'
  const initial = name.trim().charAt(0).toUpperCase() || 'C'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand-link" href="#topo" aria-label="Foody Delivery">
          <Logo />
        </a>
        <nav className="topbar-nav" aria-label="Seções do painel">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="topbar-right">
          <span className="user-chip">
            <span className="user-avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="user-greeting">Olá, {name}</span>
          </span>
          <button className="button button-logout" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>
      {children}
      <footer className="app-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo className="on-dark" />
            <p>Acompanhe cada etapa do pedido, do preparo até a porta do cliente.</p>
          </div>
          <div>
            <p className="footer-title">Painel</p>
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title">Etapas</p>
            <ul>
              <li>{statusLabel.RECEBIDO}</li>
              <li>{statusLabel.EM_PREPARO}</li>
              <li>{statusLabel.SAIU_PARA_ENTREGA}</li>
              <li>{statusLabel.ENTREGUE}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Foody Delivery</span>
          <a href="#topo">
            Voltar ao topo <Icon name="arrowRight" className="turn-up" />
          </a>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { api } from '../api'
import { Logo } from './Brand'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result =
        mode === 'login'
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form)
      onAuth(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="Foody Delivery">
        <div className="auth-brand">
          <Logo />
          <span>Gestão de entregas</span>
        </div>
        <div className="auth-message">
          <p className="brand-kicker">FOODY DELIVERY</p>
          <h1>
            Pedidos em movimento.
            <br />
            <span>Entrega sob controle.</span>
          </h1>
          <p className="auth-description">
            Acompanhe cada etapa da operação em um painel simples e organizado.
          </p>
        </div>
        <div className="route-preview" aria-hidden="true">
          <div className="route-stops">
            <i />
            <i />
            <i />
          </div>
          <div className="route-labels">
            <span>Recebido</span>
            <span>Em rota</span>
            <span>Entregue</span>
          </div>
          <div className="route-caption">
            <span className="route-dot" /> Fluxo de entrega
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <Logo />
          </div>
          <p className="auth-overline">Acesso à operação</p>
          <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>
          <p className="auth-intro">
            {mode === 'login'
              ? 'Acesse seu painel para acompanhar os pedidos.'
              : 'Cadastre-se para começar a organizar as entregas.'}
          </p>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && (
              <label>
                Nome completo
                <input
                  required
                  maxLength="120"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Como podemos te chamar?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                required
                maxLength="254"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="voce@email.com"
              />
            </label>
            <label>
              Senha
              <input
                required
                minLength="8"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="Mínimo de 8 caracteres"
              />
            </label>
            <button className="button button-primary button-full" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
          <p className="switch-auth">
            {mode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

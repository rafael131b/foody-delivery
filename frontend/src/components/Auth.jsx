import { useState } from 'react'
import { api } from '../api'
import { Logo } from './Brand'
import { Icon, RiderScene } from './Illustrations'

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
      <section className="auth-hero" aria-label="Foody Delivery">
        <span className="deco-cross cross-a" aria-hidden="true" />
        <span className="deco-cross cross-b" aria-hidden="true" />
        <span className="deco-cross cross-c" aria-hidden="true" />
        <Logo />
        <div className="auth-message">
          <p className="brand-kicker">Gestão de entregas</p>
          <h1>
            Entregas em movimento.
            <br />
            Operação sob controle.
          </h1>
          <p className="auth-description">
            Acompanhe cada etapa da operação em um painel simples e organizado.
          </p>
        </div>
        <div className="auth-art" aria-hidden="true">
          <RiderScene />
          <div className="hero-tag">
            <span className="hero-tag-dot" />
            <span>
              <strong>Saiu para entrega</strong>
            </span>
          </div>
        </div>
        <ol className="auth-steps" aria-label="Etapas do pedido">
          <li>
            <span className="step-icon">
              <Icon name="inbox" />
            </span>
            <span className="step-name">Recebido</span>
          </li>
          <li>
            <span className="step-icon">
              <Icon name="pot" />
            </span>
            <span className="step-name">Em preparo</span>
          </li>
          <li>
            <span className="step-icon">
              <Icon name="scooter" />
            </span>
            <span className="step-name">Saiu para entrega</span>
          </li>
          <li>
            <span className="step-icon">
              <Icon name="check" />
            </span>
            <span className="step-name">Entregue</span>
          </li>
        </ol>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-swap" key={mode}>
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
          </div>
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

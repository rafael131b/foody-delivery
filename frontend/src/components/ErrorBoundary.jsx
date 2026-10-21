import { Component } from 'react'
import { EmptyBag } from './Illustrations'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Falha ao renderizar a aplicação Foody Delivery', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="auth-page auth-page-single" role="alert">
          <section className="auth-panel">
            <div className="auth-card error-card">
              <EmptyBag />
              <p className="brand-kicker">Foody Delivery</p>
              <h1>Não conseguimos exibir esta tela</h1>
              <p className="auth-intro">
                Seus pedidos continuam salvos. Tente carregar a aplicação novamente.
              </p>
              <button
                className="button button-primary button-full"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

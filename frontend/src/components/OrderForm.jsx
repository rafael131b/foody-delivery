import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { Icon } from './Illustrations'

const emptyOrder = { customer: '', address: '', complement: '', items: '' }
const closeDelay = 260

export default function OrderForm({ token, onCreated, onCancel }) {
  const [form, setForm] = useState(emptyOrder)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  // Fecha com a animação de saída antes de desmontar o painel.
  const close = () => {
    if (closing) return
    setClosing(true)
    closeTimer.current = window.setTimeout(onCancel, closeDelay)
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const items = form.items
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
        .join('\n')
      await api.createOrder(
        {
          customer: form.customer,
          deliveryAddress: form.address,
          complement: form.complement,
          items,
        },
        token,
      )
      setForm(emptyOrder)
      onCreated()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`form-wrap${closing ? ' is-closing' : ''}`}>
      <div className="form-wrap-inner">
        <section className="form-card">
          <div className="section-heading">
            <div>
              <p className="brand-kicker">Novo pedido</p>
              <h2>Dados da entrega</h2>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={close}
              aria-label="Fechar formulário"
            >
              <Icon name="close" />
            </button>
          </div>
          {error && (
            <div className="alert" role="alert">
              {error}
            </div>
          )}
          <form className="order-form" onSubmit={submit}>
            <label className="field-customer">
              Nome do cliente
              <input
                required
                autoFocus
                maxLength="120"
                value={form.customer}
                onChange={(event) => setForm({ ...form, customer: event.target.value })}
                placeholder="Ex.: Ana Souza"
              />
            </label>
            <label className="field-address">
              Endereço de entrega
              <textarea
                required
                maxLength="500"
                rows="2"
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="Rua, número, complemento e bairro"
              />
            </label>
            <label className="field-complement">
              <span>
                Complemento <span className="field-hint">opcional</span>
              </span>
              <input
                maxLength="200"
                value={form.complement}
                onChange={(event) => setForm({ ...form, complement: event.target.value })}
                placeholder="Ex.: apartamento, bloco ou referência"
              />
            </label>
            <label className="field-items">
              <span>
                Itens do pedido <span className="field-hint">um item por linha</span>
              </span>
              <textarea
                required
                maxLength="2000"
                rows="3"
                value={form.items}
                onChange={(event) => setForm({ ...form, items: event.target.value })}
                placeholder={'1x Smash Foody\n1x Batata crocante'}
              />
            </label>
            <div className="form-actions">
              <button type="button" className="button button-secondary" onClick={close}>
                Cancelar
              </button>
              <button className="button button-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar pedido'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

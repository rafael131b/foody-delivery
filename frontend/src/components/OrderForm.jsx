import { useState } from 'react'
import { api } from '../api'

const emptyOrder = { customer: '', address: '', complement: '', items: '' }

export default function OrderForm({ token, onCreated, onCancel }) {
  const [form, setForm] = useState(emptyOrder)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    <section className="form-card">
      <div className="section-heading">
        <div>
          <p className="brand-kicker">Novo pedido</p>
          <h2>Dados da entrega</h2>
        </div>
        <button className="icon-button" onClick={onCancel} aria-label="Fechar formulário">
          ×
        </button>
      </div>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      <form className="order-form" onSubmit={submit}>
        <label>
          Nome do cliente
          <input
            required
            maxLength="120"
            value={form.customer}
            onChange={(event) => setForm({ ...form, customer: event.target.value })}
            placeholder="Ex.: Ana Souza"
          />
        </label>
        <label>
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
        <label>
          Complemento <span className="field-hint">opcional</span>
          <input
            maxLength="200"
            value={form.complement}
            onChange={(event) => setForm({ ...form, complement: event.target.value })}
            placeholder="Ex.: apartamento, bloco ou referência"
          />
        </label>
        <label>
          Itens do pedido <span className="field-hint">um item por linha</span>
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
          <button type="button" className="button button-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="button button-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar pedido'}
          </button>
        </div>
      </form>
    </section>
  )
}

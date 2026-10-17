const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function friendlyMessage(status, path) {
  if (status === 400 || status === 422) return 'Confira os dados informados e tente novamente.'
  if (status === 401) {
    return path === '/auth/login'
      ? 'E-mail ou senha não conferem. Verifique e tente novamente.'
      : 'Sua sessão expirou. Entre novamente para continuar.'
  }
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Não encontramos o recurso solicitado. Atualize a página e tente novamente.'
  if (status === 409) return 'Este e-mail já está cadastrado. Tente entrar na sua conta.'
  if (status === 429) return 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.'
  if (status >= 500) return 'O serviço está temporariamente indisponível. Tente novamente em instantes.'
  return 'Não foi possível concluir a operação. Tente novamente.'
}

async function request(path, options = {}) {
  const token = localStorage.getItem('foody_token')
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.')
  }

  if (!response.ok) {
    throw new Error(friendlyMessage(response.status, path))
  }
  if (response.status === 204) return null
  return response.json()
}

export const api = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  orders: () => request('/orders'),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

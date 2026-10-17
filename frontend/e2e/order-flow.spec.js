import { test, expect } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL || 'http://127.0.0.1:8080'
const viewerUrl = process.env.E2E_VIEWER_URL || 'http://127.0.0.1:8081'

test('registers, manages an order, and persists it in the read-only SQLite viewer', async ({ page, browser }) => {
  const suffix = Date.now()
  const email = 'e2e-' + suffix + '@example.test'
  const password = 'E2e-password-' + suffix
  const customer = 'Cliente E2E ' + suffix
  const complement = 'Bloco E2E ' + suffix

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
  await page.getByRole('button', { name: 'Cadastre-se' }).click()
  await page.getByLabel('Nome completo').fill('Usuário E2E')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible()
  await expect(page.getByText('Nenhum pedido por enquanto')).toBeVisible()
  await page.getByRole('button', { name: /Novo pedido/ }).first().click()
  await page.getByLabel('Nome do cliente').fill(customer)
  await page.getByLabel('Endereço de entrega').fill('Rua de Teste, 123, Centro')
  await page.getByLabel('Complemento').fill(complement)
  await page.getByLabel('Itens do pedido').fill('1x Pedido de teste\n1x Batata')
  await page.getByRole('button', { name: 'Salvar pedido' }).click()

  const order = page.getByRole('article').filter({ hasText: customer })
  await expect(order).toBeVisible()
  await expect(order).toContainText('Recebido')
  await expect(order).toContainText(complement)
  await order.getByRole('combobox').selectOption('EM_PREPARO')
  await expect(order).toContainText('Em preparo')

  await page.reload()
  const persistedOrder = page.getByRole('article').filter({ hasText: customer })
  await expect(persistedOrder).toBeVisible()
  await expect(persistedOrder).toContainText('Em preparo')

  const token = await page.evaluate(() => localStorage.getItem('foody_token'))
  for (let index = 0; index < 10; index++) {
    const response = await page.request.post(`${apiUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        customer: `Pedido de paginação ${index}`,
        items: '1x Item de teste',
        deliveryAddress: 'Rua de Teste, 999',
      },
    })
    expect(response.status()).toBe(201)
  }

  const orderListRequests = []
  page.on('request', request => {
    if (request.url().includes('/api/orders?')) orderListRequests.push(request.url())
  })
  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(10)
  await expect(page.getByText('Página 1 de 2')).toBeVisible()
  expect(orderListRequests.some(url => url.includes('page=0') && url.includes('size=10'))).toBe(true)

  await page.getByRole('button', { name: /Em preparo/ }).click()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByText('1 pedido', { exact: true })).toBeVisible()
  expect(orderListRequests.some(url => url.includes('status=EM_PREPARO'))).toBe(true)

  await page.getByRole('button', { name: /Todos/ }).click()
  await page.getByRole('button', { name: 'Próxima' }).click()
  await expect(page.getByText('Página 2 de 2')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('article').filter({ hasText: customer })).toBeVisible()
  expect(orderListRequests.some(url => url.includes('page=1') && url.includes('size=10'))).toBe(true)

  const viewer = await browser.newPage()
  await expect.poll(async () => {
    const response = await viewer.request.get(`${viewerUrl}/health`)
    return response.status()
  }, { timeout: 30_000 }).toBe(200)
  await viewer.goto(`${viewerUrl}/`)
  const databasePage = await viewer.locator('body').innerText()
  expect(databasePage).toContain('Estrutura da tabela')
  expect(databasePage).toContain('password_hash')
  expect(databasePage).toContain('Hash armazenado')
  expect(databasePage).toContain(customer)
  expect(databasePage).toContain(complement)
  expect(databasePage).toContain('EM_PREPARO')
  expect(databasePage).not.toContain(password)
  await viewer.close()
})

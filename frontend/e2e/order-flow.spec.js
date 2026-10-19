import { test, expect } from '@playwright/test'

const apiUrl = process.env.E2E_API_URL || 'http://127.0.0.1:8080'
const viewerUrl = process.env.E2E_VIEWER_URL || 'http://127.0.0.1:8081'

test('serves interactive Swagger documentation for the API', async ({ page, request }) => {
  const openApiResponse = await request.get(`${apiUrl}/v3/api-docs`)
  expect(openApiResponse.ok()).toBe(true)

  const definition = await openApiResponse.json()
  expect(definition.info.title).toBe('Foody Delivery API')
  expect(definition.paths).toHaveProperty('/api/auth/login')
  expect(definition.paths).toHaveProperty('/api/orders')
  expect(definition.components.securitySchemes.bearerAuth.scheme).toBe('bearer')

  await page.goto(`${apiUrl}/swagger-ui/index.html`)
  await expect(page.getByText('Foody Delivery API')).toBeVisible()
  await expect(page.getByRole('button', { name: 'GET /api/orders', exact: true })).toBeVisible()
})

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
  expect(databasePage).toContain('Usuário E2E')
  expect(databasePage).toContain('EM_PREPARO')
  expect(databasePage).not.toContain(password)
  await viewer.close()
})

test('keeps orders isolated when registering and logging into different accounts', async ({ page }) => {
  const suffix = Date.now()
  const firstEmail = `owner-${suffix}@example.test`
  const secondEmail = `other-${suffix}@example.test`
  const firstPassword = `First-${suffix}-password`
  const secondPassword = `Second-${suffix}-password`
  const firstOrder = `Pedido da primeira conta ${suffix}`
  const secondOrder = `Pedido da segunda conta ${suffix}`
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))

  const register = async (name, email, password) => {
    await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
    await page.getByRole('button', { name: 'Cadastre-se' }).click()
    await page.getByLabel('Nome completo').fill(name)
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Criar conta' }).click()
    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible()
  }

  const login = async (email, password) => {
    await expect(page.getByRole('heading', { name: 'Entre na sua conta' })).toBeVisible()
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha').fill(password)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible()
  }

  const createOrder = async customer => {
    await page.getByRole('button', { name: /Novo pedido/ }).first().click()
    await page.getByLabel('Nome do cliente').fill(customer)
    await page.getByLabel('Endereço de entrega').fill('Rua de Teste, 123')
    await page.getByLabel('Itens do pedido').fill('1x Pedido de teste')
    await page.getByRole('button', { name: 'Salvar pedido' }).click()
    await expect(page.getByRole('article').filter({ hasText: customer })).toBeVisible()
  }

  await page.goto('/')
  await register('Primeiro Responsável', firstEmail, firstPassword)
  await createOrder(firstOrder)

  await page.getByRole('button', { name: 'Sair' }).click()
  await register('Segundo Responsável', secondEmail, secondPassword)
  await expect(page.getByText('Nenhum pedido por enquanto')).toBeVisible()
  await expect(page.getByText(firstOrder)).toHaveCount(0)
  await createOrder(secondOrder)

  await page.getByRole('button', { name: 'Sair' }).click()
  await login(firstEmail, firstPassword)
  await expect(page.getByRole('article').filter({ hasText: firstOrder })).toBeVisible()
  await expect(page.getByText(secondOrder)).toHaveCount(0)

  await page.getByRole('button', { name: 'Sair' }).click()
  await login(secondEmail, secondPassword)
  await expect(page.getByRole('article').filter({ hasText: secondOrder })).toBeVisible()
  await expect(page.getByText(firstOrder)).toHaveCount(0)
  expect(pageErrors).toEqual([])
})

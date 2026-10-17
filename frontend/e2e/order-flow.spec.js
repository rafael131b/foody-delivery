import { test, expect } from '@playwright/test'

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

  const viewer = await browser.newPage()
  await expect.poll(async () => {
    const response = await viewer.request.get('http://127.0.0.1:8081/health')
    return response.status()
  }, { timeout: 30_000 }).toBe(200)
  await viewer.goto('http://127.0.0.1:8081/')
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
/**
 * E2E tests for capability CRUD (create, rename, delete) via the UI.
 *
 * Prerequisites:
 *   - API server running on http://localhost:3001
 *   - At least one ModelType and one NodeKind seeded in the database
 *
 * The suite sets up a fresh model + domain + group via the API before running,
 * and deletes the model afterwards (cascades to all nodes).
 */

import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001'

test.describe('Capability CRUD', () => {
  let modelId = ''
  let groupId = ''
  let nodeKindId = ''

  // ── Scaffold: one model + domain + group shared across the suite ──────────

  test.beforeAll(async ({ request }) => {
    // Fetch reference data
    const typesRes = await request.get(`${API}/api/model-types`)
    expect(typesRes.ok(), 'GET /api/model-types failed — is the API running?').toBeTruthy()
    const types: { id: string; name: string }[] = await typesRes.json()
    if (!types.length) test.skip(true, 'No ModelTypes in database — seed the database first')
    const modelTypeId = types[0].id

    const kindsRes = await request.get(`${API}/api/node-kinds`)
    expect(kindsRes.ok(), 'GET /api/node-kinds failed').toBeTruthy()
    const kinds: { id: string; name: string }[] = await kindsRes.json()
    if (!kinds.length) test.skip(true, 'No NodeKinds in database — seed the database first')
    nodeKindId = kinds[0].id

    // Create the test model
    const modelRes = await request.post(`${API}/api/models`, {
      data: { name: `E2E Test ${Date.now()}`, modelTypeId },
    })
    expect(modelRes.ok(), `Create model failed: ${await modelRes.text()}`).toBeTruthy()
    modelId = (await modelRes.json()).id

    // Create domain (level 1)
    const domainRes = await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Test Domain', level: 1 },
    })
    expect(domainRes.ok(), `Create domain failed: ${await domainRes.text()}`).toBeTruthy()
    const domainId: string = (await domainRes.json()).id

    // Create group (level 2)
    const groupRes = await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Test Group', level: 2, parentId: domainId },
    })
    expect(groupRes.ok(), `Create group failed: ${await groupRes.text()}`).toBeTruthy()
    groupId = (await groupRes.json()).id
  })

  test.afterAll(async ({ request }) => {
    if (modelId) {
      await request.delete(`${API}/api/models/${modelId}`)
    }
  })

  // ── Helper: load the test model in the UI ─────────────────────────────────

  async function loadModel(page: import('@playwright/test').Page) {
    await page.goto('/')
    await page.selectOption('#model-select', modelId)
    // Wait until the group card is visible (tree has loaded)
    await expect(page.locator('.group-card')).toBeVisible()
  }

  // ── Test 1: Create a capability via the UI ────────────────────────────────

  test('create a capability', async ({ page }) => {
    await loadModel(page)

    // The "Add Capability" button is always visible at the bottom of each group
    await page.click('.group-card button:has-text("Add Capability")')

    // Modal should appear
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('.modal h2')).toHaveText('Add Capability')

    // Fill name, select kind, and provide required properties
    await page.fill('#nf-name', 'UI Created Capability')
    await page.selectOption('#nf-kind', nodeKindId)
    await page.fill('#nf-props', '{"maturity": "Initial"}')

    // Submit
    await page.click('.modal button:has-text("Add")')

    // Modal closes and capability appears in the map
    await expect(page.locator('.modal')).not.toBeVisible()
    await expect(
      page.locator('.capability-card').filter({ hasText: 'UI Created Capability' }),
    ).toBeVisible()
  })

  // ── Test 2: Rename a capability via the UI ────────────────────────────────

  test('rename a capability', async ({ page, request }) => {
    // Create a dedicated capability via API so this test is independent
    const capRes = await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Rename Me', level: 3, parentId: groupId, kindId: nodeKindId, properties: { maturity: 'Initial' } },
    })
    expect(capRes.ok(), `create cap failed: ${await capRes.text()}, modelId=${modelId} groupId=${groupId}`).toBeTruthy()

    await loadModel(page)

    const capCard = page.locator('.capability-card').filter({ hasText: 'Rename Me' })
    await expect(capCard).toBeVisible()

    // Hover to reveal the edit affordance, then click the edit button
    await capCard.hover()
    await capCard.locator('button[title="Edit capability"]').click()

    // Modal opens pre-filled with current name
    await expect(page.locator('.modal')).toBeVisible()
    await expect(page.locator('.modal h2')).toHaveText('Edit Capability')
    await expect(page.locator('#nf-name')).toHaveValue('Rename Me')

    // Clear and type the new name
    await page.fill('#nf-name', 'Renamed Capability')
    await page.click('.modal button:has-text("Save")')

    // Modal closes, old name gone, new name visible
    await expect(page.locator('.modal')).not.toBeVisible()
    await expect(
      page.locator('.capability-card').filter({ hasText: 'Renamed Capability' }),
    ).toBeVisible()
    await expect(
      page.locator('.capability-card').filter({ hasText: 'Rename Me' }),
    ).not.toBeVisible()
  })

  // ── Test 3: Delete a capability via the UI ────────────────────────────────

  test('delete a capability', async ({ page, request }) => {
    // Create a dedicated capability via API so this test is independent
    const capRes = await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Delete Me', level: 3, parentId: groupId, kindId: nodeKindId, properties: { maturity: 'Initial' } },
    })
    expect(capRes.ok()).toBeTruthy()

    await loadModel(page)

    const capCard = page.locator('.capability-card').filter({ hasText: 'Delete Me' })
    await expect(capCard).toBeVisible()

    // Hover to reveal delete affordance
    await capCard.hover()

    // Accept the browser confirm() dialog, then click delete
    page.once('dialog', (dialog) => dialog.accept())
    await capCard.locator('button[title="Delete capability"]').click()

    // Capability is removed from the map
    await expect(
      page.locator('.capability-card').filter({ hasText: 'Delete Me' }),
    ).not.toBeVisible()
  })

  // ── Test 4: Delete affordance is disabled for non-leaf capabilities ────────

  test('delete is disabled when capability has sub-capabilities', async ({ page, request }) => {
    // Create a capability with a child sub-capability
    const capRes = await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Has Children', level: 3, parentId: groupId, kindId: nodeKindId, properties: { maturity: 'Initial' } },
    })
    expect(capRes.ok()).toBeTruthy()
    const capId: string = (await capRes.json()).id

    await request.post(`${API}/api/models/${modelId}/nodes`, {
      data: { name: 'Child Sub-cap', level: 4, parentId: capId, kindId: nodeKindId, properties: { maturity: 'Initial' } },
    })

    await loadModel(page)

    const capCard = page.locator('.capability-card').filter({ hasText: 'Has Children' })
    await capCard.hover()

    // Delete button should exist but be disabled
    const deleteBtn = capCard.locator('button[title="Delete capability"]')
    await expect(deleteBtn).toBeDisabled()
  })
})

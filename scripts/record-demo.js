// Graba un video .webm recorriendo la app en producción.
// Uso: node scripts/record-demo.js
const { chromium } = require('playwright')

const BASE = 'https://don-valdez.vercel.app'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function scrollTo(page, y) {
  await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'smooth' }), y)
  await sleep(1600)
}

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'video', size: { width: 1280, height: 720 } },
    locale: 'es-AR',
  })
  const page = await ctx.newPage()

  // 1) Landing: scroll completo
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await sleep(3000)
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y <= height; y += 650) await scrollTo(page, y)
  await scrollTo(page, 0)
  await sleep(800)

  // 2) Turnos
  await page.goto(`${BASE}/turnos`, { waitUntil: 'domcontentloaded' })
  await sleep(2500)

  // servicio
  await page.locator('ul.space-y-2 li button').first().click()
  await sleep(1200)

  // día: probar cada día habilitado hasta que aparezcan horarios libres
  const days = page.locator('.grid-cols-7 button:not([disabled])')
  const dayCount = await days.count()
  let picked = false
  for (let i = 0; i < dayCount && !picked; i++) {
    await days.nth(i).click()
    await sleep(2000)
    picked =
      (await page.locator('.grid-cols-4 button:not([disabled])').count()) > 0
  }
  if (!picked) throw new Error('Ningún día tiene horarios disponibles')

  // primer horario disponible
  await page.locator('.grid-cols-4 button:not([disabled])').first().click()
  await sleep(1200)

  // datos
  await page.getByPlaceholder('Nombre y apellido').fill('PRUEBA VIDEO')
  await sleep(600)
  await page.getByPlaceholder('WhatsApp — ej: 3874123456').fill('3874000000')
  await sleep(800)

  // pago en efectivo
  await page.getByRole('button', { name: 'Efectivo en el local' }).click()
  await sleep(1500)

  // confirmar → resultado
  await page.getByRole('button', { name: 'Confirmar turno' }).click()
  await page.waitForURL(/resultado/, { timeout: 20000 })
  await sleep(5000)

  await ctx.close()
  await browser.close()
  console.log('video listo en ./video/')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

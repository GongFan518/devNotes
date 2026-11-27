// Open the search dialog, optionally type a query, and screenshot it.
// Usage: node scripts/shoot-search.mjs [query]
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9339
const BASE = 'http://localhost:3000'
const OUT = resolve('.shots')
const PROFILE = join(tmpdir(), 'devnotes-chrome-profile')
const query = process.argv[2] ?? ''

mkdirSync(OUT, { recursive: true })
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--hide-scrollbars',
    '--disable-gpu',
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break
  } catch {
    /* wait */
  }
  await sleep(150)
}

const tab = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
).json()
const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let id = 0
const pending = new Map()
ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? msg)
    pending.delete(msg.id)
  }
})
const send = (method, params = {}) =>
  new Promise((res) => {
    const myId = ++id
    pending.set(myId, res)
    ws.send(JSON.stringify({ id: myId, method, params }))
  })
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  return r?.result?.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})

const loaded = new Promise((res) => {
  const handler = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.method === 'Page.loadEventFired') {
      ws.removeEventListener('message', handler)
      res()
    }
  }
  ws.addEventListener('message', handler)
})
await send('Page.navigate', { url: `${BASE}/` })
await loaded
await evaluate('document.fonts.ready.then(() => 1)')
await evaluate(
  `(() => { const s = document.createElement('style'); s.textContent = 'nextjs-portal{display:none !important}'; document.head.appendChild(s) })()`
)
await sleep(900)

// open the dialog
const opened = await evaluate(`(() => {
  const btn = document.querySelector('.k-tools button[aria-label^="搜索"]')
  if (!btn) return false
  btn.click()
  return true
})()`)
console.log('clicked search button:', opened)
await sleep(700)

if (query) {
  await evaluate(`document.querySelector('.k-searchbox-head input')?.focus()`)
  await send('Input.insertText', { text: query })
  await sleep(500)
}

const shot = await send('Page.captureScreenshot', { format: 'png' })
const name = query ? `search-${query}` : 'search'
const file = `${OUT}/${name}.png`
writeFileSync(file, Buffer.from(shot.data, 'base64'))
console.log(`ok ${file}`)

const count = await evaluate(`document.querySelectorAll('.k-searchresults a').length`)
console.log('results rendered:', count)

if (process.env.SHOOT_DEBUG) {
  const styles = await evaluate(`(() => {
    const el = document.querySelector('.k-searchbox-head input')
    if (!el) return 'no input'
    const cs = getComputedStyle(el)
    return JSON.stringify({
      outline: cs.outline,
      outlineColor: cs.outlineColor,
      outlineStyle: cs.outlineStyle,
      boxShadow: cs.boxShadow,
      border: cs.border,
      focusVisible: el.matches(':focus-visible'),
      focused: document.activeElement === el,
    })
  })()`)
  console.log('input styles:', styles)
}

ws.close()
chrome.kill()

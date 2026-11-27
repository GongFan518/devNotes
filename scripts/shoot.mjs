// Capture full-page screenshots of the concept pages via the Chrome DevTools Protocol.
// Usage: node scripts/shoot.mjs [names...]
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333
const BASE = 'http://localhost:3000'
const OUT = resolve('.shots')
// The Chrome profile must live outside the project: it writes thousands of files
// continuously, and Next's dev watcher would recompile on every one of them.
const PROFILE = join(tmpdir(), 'devnotes-chrome-profile')

const TARGETS = [
  { name: 'home', url: `${BASE}/`, width: 1440, height: 900 },
  { name: 'blog', url: `${BASE}/blog/`, width: 1440, height: 900 },
  { name: 'post', url: `${BASE}/blog/state-outside-the-component/`, width: 1440, height: 900 },
  { name: 'tags', url: `${BASE}/tags/`, width: 1440, height: 900 },
  { name: 'tag', url: `${BASE}/tags/css/`, width: 1440, height: 900 },
  { name: 'about', url: `${BASE}/about/`, width: 1440, height: 900 },
  { name: 'collections', url: `${BASE}/collections/`, width: 1440, height: 900 },
  { name: 'collection', url: `${BASE}/collections/rebuilds/`, width: 1440, height: 900 },
  {
    name: 'collection-post',
    url: `${BASE}/collections/rebuilds/three-attempts-at-a-homepage/`,
    width: 1440,
    height: 900,
  },
  { name: 'notfound', url: `${BASE}/nope/`, width: 1440, height: 900 },
  { name: 'home-mobile', url: `${BASE}/`, width: 390, height: 844 },
  {
    name: 'post-mobile',
    url: `${BASE}/blog/state-outside-the-component/`,
    width: 390,
    height: 844,
  },
]

const only = process.argv.slice(2)
const targets = only.length ? TARGETS.filter((t) => only.includes(t.name)) : TARGETS

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
    '--no-default-browser-check',
    '--force-device-scale-factor=1',
    '--force-color-profile=srgb',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

async function waitForChrome() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* not up yet */
    }
    await sleep(150)
  }
  throw new Error('Chrome did not expose the debugging port')
}

class Session {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.events = new Map()
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method && this.events.has(msg.method)) {
        for (const fn of this.events.get(msg.method)) fn(msg.params)
        this.events.delete(msg.method)
      }
    })
  }

  on(method) {
    return new Promise((resolve) => {
      const list = this.events.get(method) ?? []
      list.push(resolve)
      this.events.set(method, list)
    })
  }

  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function openTab() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  const tab = await res.json()
  const ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  return new Session(ws)
}

const results = []
const version = await waitForChrome()
console.log(`chrome ${version.Browser}`)

for (const t of targets) {
  const session = await openTab()
  try {
    await session.send('Page.enable')
    await session.send('Emulation.setDeviceMetricsOverride', {
      width: t.width,
      height: t.height,
      deviceScaleFactor: 1,
      mobile: t.width < 600,
    })
    const loaded = session.on('Page.loadEventFired')
    await session.send('Page.navigate', { url: t.url })
    await loaded
    // Review chrome and Next's dev overlay are not part of the design.
    // Set SHOOT_KEEP_CHROME=1 to capture them anyway (useful when verifying errors).
    if (!process.env.SHOOT_KEEP_CHROME) {
      await session.send('Runtime.evaluate', {
        expression: `(() => {
          const s = document.createElement('style')
          s.textContent = 'nextjs-portal{display:none !important}.sk-switch{display:none !important}'
          document.head.appendChild(s)
        })()`,
      })
    }
    // let fonts settle and any layout shift finish
    await session.send('Runtime.evaluate', {
      expression:
        'document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))',
      awaitPromise: true,
    })
    await sleep(350)

    const metrics = await session.send('Page.getLayoutMetrics')
    const size = metrics.cssContentSize ?? metrics.contentSize
    const height = Math.min(Math.ceil(size.height), 6000)
    const shot = await session.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: t.width, height, scale: 1 },
    })
    const file = `${OUT}/${t.name}.png`
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    results.push({ name: t.name, height, file })
    console.log(`ok ${t.name} ${t.width}x${height} -> ${file}`)
  } finally {
    session.ws.close()
  }
}

chrome.kill()
if (!results.length) {
  console.error('no screenshots captured')
  process.exitCode = 1
}

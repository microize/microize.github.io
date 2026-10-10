/**
 * Pre-renders one p5.brush header banner per blog post.
 *
 *   node tools/gen-blog-headers.mjs            # only posts missing an image
 *   node tools/gen-blog-headers.mjs --force    # re-render everything
 *
 * Artwork is deterministic per slug, so re-running is a no-op unless the
 * generator itself changes. Output lands in assets/images/blog/<slug>.webp
 * and is committed - the site ships static images and never loads p5.brush
 * at runtime.
 *
 * Rendering happens in headless Chromium (Edge) because p5.brush needs
 * WebGL2; SwiftShader supplies it without a GPU.
 */
import { createServer } from 'node:http'
import { readdir, readFile, mkdir, writeFile, unlink, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { extname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT_DIR = join(ROOT, 'assets', 'images', 'blog')
const WIDTH = 1280
const HEIGHT = 512
/* Render at 2x and let sharp downsample. Brush grain is largely destroyed at
   1:1; supersampling is the cheapest quality win available and costs one
   resize. */
const SCALE = 2
const PORT = 8711
const FORCE = process.argv.includes('--force')

const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
}

async function findBrowser() {
  for (const p of BROWSERS) {
    try { await access(p); return p } catch { /* keep looking */ }
  }
  throw new Error('No Chromium-based browser found. Install Edge or Chrome, or add its path to BROWSERS.')
}

/** Serve the repo over http - the generator uses an ESM import, which file:// blocks. */
function serveRepo() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      const body = await readFile(join(ROOT, path))
      res.writeHead(200, { 'content-type': MIME[extname(path)] || 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)))
}

/**
 * The acceptance test. A banner with no dark has no light either, because
 * brightness is a relationship. Downsample hard, then measure how the tones
 * actually distribute - this is what the first version failed, with four of
 * seven banners containing zero pixels below mid-grey.
 *
 * Budget: dark (L < 45%) should cover 8-12% of canvas, and the image needs a
 * genuine darkest note. Median sitting at paper means nothing was painted.
 */
async function valueReport(file) {
  const sharp = (await import('sharp')).default
  const { data } = await sharp(file).resize(120).greyscale().raw().toBuffer({ resolveWithObject: true })
  const px = [...data].sort((a, b) => a - b)
  const pct = (t) => (data.reduce((n, v) => n + (v < t ? 1 : 0), 0) / data.length) * 100
  const dark = pct(115)            // ~L* 45
  const deepest = px[Math.floor(px.length * 0.005)]
  const median = px[Math.floor(px.length / 2)]
  const flag = dark < 6 ? 'TOO LIGHT' : dark > 16 ? 'TOO HEAVY' : 'ok'
  return `dark ${dark.toFixed(1)}%  min ${deepest}  median ${median}  [${flag}]`
}

async function main() {
  const browser = await findBrowser()
  console.log(`browser: ${browser}`)

  // Eleventy strips a leading YYYY-MM-DD- from filePathStem, and the
  // headerImage filter keys off that, so match it exactly. Seeding from the
  // dated name would also mean re-dating a post silently changed its artwork.
  const slugs = (await readdir(join(ROOT, 'blog')))
    .filter((f) => f.endsWith('.md'))
    .map((f) => basename(f, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, ''))
    .sort()

  await mkdir(OUT_DIR, { recursive: true })
  const server = await serveRepo()

  let rendered = 0, skipped = 0
  try {
    for (const slug of slugs) {
      const webp = join(OUT_DIR, `${slug}.webp`)
      if (!FORCE) {
        try { await access(webp); console.log(`  skip   ${slug}`); skipped++; continue } catch { /* render it */ }
      }

      const png = join(OUT_DIR, `${slug}.png`)
      const url = `http://127.0.0.1:${PORT}/tools/blog-header-gen.html`
        + `?slug=${encodeURIComponent(slug)}&w=${WIDTH * SCALE}&h=${HEIGHT * SCALE}`

      await execFileAsync(browser, [
        '--headless=new',
        `--screenshot=${png}`,
        `--window-size=${WIDTH * SCALE},${HEIGHT * SCALE}`,
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--virtual-time-budget=20000',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--no-sandbox',
        url,
      ], { timeout: 120000 }).catch((e) => {
        // Chromium exits non-zero on some benign shutdown paths; the file is
        // the real signal, so only surface a failure if nothing was written.
        if (!e.stderr?.includes('Written to file')) { /* fall through to the check below */ }
      })

      const buf = await readFile(png).catch(() => null)
      if (!buf) throw new Error(`render produced no file for ${slug}`)

      // PNG of a noisy watercolour texture is large; WebP is ~10x smaller at
      // visually identical quality for this kind of soft-gradient artwork.
      const sharp = (await import('sharp')).default
      await sharp(buf).resize(WIDTH, HEIGHT, { kernel: 'lanczos3' })
        .webp({ quality: 82 }).toFile(webp)
      await unlink(png)

      const kb = Math.round((await readFile(webp)).length / 1024)
      console.log(`  render ${slug}  ->  ${kb} KB   ${await valueReport(webp)}`)
      rendered++
    }
  } finally {
    server.close()
  }

  console.log(`\n${rendered} rendered, ${skipped} unchanged. Output: assets/images/blog/`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fail = []

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}

const requiredPublic = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/llms.txt',
  'public/favicon.svg',
  'public/og-preview.png',
]
for (const file of requiredPublic) {
  if (!existsSync(join(root, file))) fail.push(`missing ${file}`)
}

const robots = readFileSync(join(root, 'public/robots.txt'), 'utf8')
if (!robots.includes('Sitemap:')) fail.push('robots.txt missing Sitemap')
if (!robots.includes('Disallow: /dashboard')) fail.push('robots.txt should hide /dashboard')

const llms = readFileSync(join(root, 'public/llms.txt'), 'utf8')
if (!llms.includes('# ShapeUp')) fail.push('llms.txt missing product heading')
if (!llms.includes('/privacy')) fail.push('llms.txt missing privacy map')

const landing = readFileSync(join(root, 'src/pages/LandingPage.jsx'), 'utf8')
if (landing.includes('su-lp-badge')) fail.push('Landing still has hero badge class')
if (!/to=\{`\/register\?role=\$\{plan\.role\}`\}/.test(landing) && !landing.includes('to="/register"') && !landing.includes("navigate('/register')")) fail.push('Landing CTA must link to registration')

const ds = readFileSync(join(root, 'src/styles/design-system.css'), 'utf8')
if (/family=Inter|font-family:\s*['"]Inter/.test(ds)) fail.push('design-system still uses Inter')
if (!ds.includes('oklch(')) fail.push('design-system missing oklch tokens')

const app = readFileSync(join(root, 'src/App.jsx'), 'utf8')
const stitchManifest = JSON.parse(readFileSync(join(root, 'src/stitch/manifest.json'), 'utf8'))
if (Object.keys(stitchManifest).length !== 16) fail.push('Stitch must include all 16 exported screens')
for (const name of Object.keys(stitchManifest)) {
  for (const file of [`design/stitch/${name}.html`, `src/stitch/templates/${name}.html`, `src/stitch/styles/${name}.css`]) {
    if (!existsSync(join(root, file))) fail.push(`missing original Stitch screen asset: ${file}`)
  }
  const html = readFileSync(join(root, `src/stitch/templates/${name}.html`), 'utf8')
  const css = readFileSync(join(root, `src/stitch/styles/${name}.css`), 'utf8')
  if (/<script|\son(?:click|submit)=/i.test(html)) fail.push(`Stitch ${name} has executable prototype scripts`)
  if (css.includes('.font-.stitch-body')) fail.push(`Stitch ${name} has corrupted font selectors`)
}
if (!app.includes("from './stitch/PublicPages'")) fail.push('Public routes must use the exported Stitch views')
for (const route of ['/privacy', '/terms', 'NotFound']) {
  if (!app.includes(route === 'NotFound' ? 'NotFound' : `path="${route}"`)) {
    fail.push(`App.jsx missing ${route}`)
  }
}

const secretRe = /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|aws_secret_access_key/i
for (const file of walk(join(root, 'src'))) {
  if (!/\.(js|jsx|css|html|json)$/.test(file)) continue
  const text = readFileSync(file, 'utf8')
  if (secretRe.test(text)) fail.push(`possible secret in ${relative(root, file)}`)
}

if (fail.length) {
  console.error(fail.map((m) => `FAIL ${m}`).join('\n'))
  process.exit(1)
}
console.log('frontend gates PASS')

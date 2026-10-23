import http from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { gzipSync } from 'node:zlib'
const root = resolve('out')
const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.bin': 'application/octet-stream',
}
const server = http.createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  if (base && path === base) {
    response.writeHead(301, { Location: `${base}/` })
    response.end()
    return
  }
  if (base && !path.startsWith(`${base}/`)) {
    response.writeHead(404)
    response.end()
    return
  }
  let file = resolve(root, '.' + path.slice(base.length))
  if (!file.startsWith(root)) {
    response.writeHead(403)
    response.end()
    return
  }
  try {
    if (statSync(file).isDirectory()) file = resolve(file, 'index.html')
    const headers = {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': file.includes('_next')
        ? 'public, max-age=31536000, immutable'
        : extname(file) === '.html'
          ? 'no-cache'
          : 'public, max-age=86400',
    }
    let data = readFileSync(file)
    if (
      /html|javascript|css|json|svg|xml|text/.test(headers['Content-Type']) &&
      request.headers['accept-encoding']?.includes('gzip')
    ) {
      data = gzipSync(data)
      headers['Content-Encoding'] = 'gzip'
      headers.Vary = 'Accept-Encoding'
    }
    response.writeHead(200, headers)
    response.end(data)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    response.end(readFileSync(resolve(root, '404.html')))
  }
})
server.listen(Number(process.env.PORT || 3021), '127.0.0.1', () =>
  console.log(`Static export: http://localhost:${process.env.PORT || 3021}${base}/`),
)

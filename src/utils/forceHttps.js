export function redirectToHttpsIfNeeded(locationLike = window.location) {
  const host = locationLike.hostname
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  if (!import.meta.env.PROD || isLocal) return false
  if (locationLike.protocol === 'http:') {
    const next = `https:${locationLike.href.slice(locationLike.protocol.length)}`
    locationLike.replace(next)
    return true
  }
  return false
}

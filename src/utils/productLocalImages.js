const imageModules = import.meta.glob(
  '../assets/images/products/*.{jpg,jpeg,png}',
  { eager: true, query: '?url', import: 'default' },
)

export function sanitizeProductImageName(name) {
  return name ? name.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim() : ''
}

const imageMap = Object.entries(imageModules).reduce((acc, [path, url]) => {
  const filename = path.split('/').pop()
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1) return acc

  const baseName = filename.slice(0, dotIndex)
  const ext = filename.slice(dotIndex + 1).toLowerCase()
  const key = sanitizeProductImageName(baseName)

  if (!acc[key]) acc[key] = {}
  acc[key][ext] = url
  return acc
}, {})

export function getLocalProductImageUrls(productName) {
  const key = sanitizeProductImageName(productName)
  const entry = imageMap[key]

  return {
    jpg: entry?.jpg ?? null,
    jpeg: entry?.jpeg ?? null,
    png: entry?.png ?? null,
  }
}

/** First matching local asset (jpg → jpeg → png), or null if none. */
export function getPreferredLocalProductImageUrl(productName) {
  const { jpg, jpeg, png } = getLocalProductImageUrls(productName)
  return jpg || jpeg || png || null
}

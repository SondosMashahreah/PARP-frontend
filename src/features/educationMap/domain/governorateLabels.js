import { geometryBounds } from './geography.js'

// Pick a position from the actual governorate boundary, not a hard-coded coordinate.
// Prefer the largest land polygon for MultiPolygon features, avoiding tiny islands.
function ringArea(ring) {
  let twiceArea = 0
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[(i + 1) % ring.length]
    twiceArea += x1 * y2 - x2 * y1
  }
  return twiceArea
}

function insideRing(point, ring) {
  const [px, py] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function governorateLabelPoint(feature) {
  const geometry = feature?.geometry
  const polygons = geometry?.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry?.type === 'MultiPolygon' ? geometry.coordinates : []
  const rings = polygons.map((polygon) => polygon?.[0])
    .filter((ring) => Array.isArray(ring) && ring.length >= 3)
    .sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))
  const ring = rings[0]
  if (!ring) return null
  const bounds = geometryBounds({ coordinates: ring })
  if (!bounds) return null
  const [[west, south], [east, north]] = bounds
  if (west === east || south === north) return null

  let xSum = 0, ySum = 0
  const twiceArea = ringArea(ring)
  if (Math.abs(twiceArea) > 1e-12) {
    for (let i = 0; i < ring.length; i++) {
      const [x1, y1] = ring[i]
      const [x2, y2] = ring[(i + 1) % ring.length]
      const cross = x1 * y2 - x2 * y1
      xSum += (x1 + x2) * cross
      ySum += (y1 + y2) * cross
    }
  }
  const candidates = []
  if (Math.abs(twiceArea) > 1e-12) {
    candidates.push([xSum / (3 * twiceArea), ySum / (3 * twiceArea)])
  }
  candidates.push([(west + east) / 2, (south + north) / 2])
  // Concave governorates may have centroids outside the boundary.
  for (const dy of [0.5, 0.35, 0.65, 0.2, 0.8]) {
    for (const dx of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      candidates.push([west + (east - west) * dx, south + (north - south) * dy])
    }
  }
  return candidates.find((point) => insideRing(point, ring)) || null
}

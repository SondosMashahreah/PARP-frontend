/** Smooth cinematic camera flight. */
export function flyTo(map, target) {
  map.flyTo({
    center: target.center,
    zoom: target.zoom ?? map.getZoom(),
    pitch: target.pitch ?? map.getPitch(),
    bearing: target.bearing ?? map.getBearing(),
    duration: target.duration ?? 1400,
    essential: true,
    curve: 1.42,
  });
}

/** Bounding box of any GeoJSON geometry. */
export function boundsOf(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (c) => {
    if (typeof c[0] === 'number') {
      const [x, y] = c;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else c.forEach(visit);
  };
  visit(geometry.coordinates);
  return [[minX, minY], [maxX, maxY]];
}
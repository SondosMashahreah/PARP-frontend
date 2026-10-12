import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../../i18n/useLanguage.js'
import { usePlatformData } from '../../features/platform/usePlatformData.js'
import {
  historicalPalestineUrl,
  historicalPalestineBounds,
  historicalPalestineSource,
} from '../../features/educationMap/data/historicalPalestine.js'
import './MapPage.css'
import './StatisticsMap.css'
const color = (value) =>
  value === 0
    ? '#64748b'
    : value <= 5
      ? '#4eb3d3'
      : value <= 20
        ? '#29a58b'
        : '#edbd62'
function StatisticalCanvas({ data, metric, isArabic, onSelect }) {
  const host = useRef(null),
    selectRef = useRef(onSelect),
    [error, setError] = useState('')
  useEffect(() => {
    selectRef.current = onSelect
  }, [onSelect])
  useEffect(() => {
    let map,
      disposed = false
    try {
      map = new maplibregl.Map({
        container: host.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: { 'background-color': '#14101b' },
            },
          ],
        },
        bounds: historicalPalestineBounds,
        fitBoundsOptions: { padding: 25 },
        renderWorldCopies: false,
        dragRotate: false,
        cooperativeGestures: true,
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }))
      map.on('load', () => {
        if (disposed) return
        map.addSource('outline', {
          type: 'geojson',
          data: historicalPalestineUrl,
          attribution: historicalPalestineSource,
        })
        map.addLayer({
          id: 'outline-fill',
          type: 'fill',
          source: 'outline',
          paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.045 },
        })
        map.addLayer({
          id: 'outline-line',
          type: 'line',
          source: 'outline',
          paint: { 'line-color': '#918498', 'line-width': 1.3 },
        })
        const features = data.directorates
          .filter((d) => d.geometry)
          .map((d) => ({
            type: 'Feature',
            properties: { id: d.id, value: d[metric] || 0 },
            geometry:
              d.geometry.type === 'Feature' ? d.geometry.geometry : d.geometry,
          }))
        map.addSource('directorates', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features },
        })
        map.addLayer({
          id: 'directorates-fill',
          type: 'fill',
          source: 'directorates',
          paint: {
            'fill-color': [
              'step',
              ['get', 'value'],
              '#64748b',
              1,
              '#4eb3d3',
              6,
              '#29a58b',
              21,
              '#edbd62',
            ],
            'fill-opacity': 0.35,
          },
        })
        map.addLayer({
          id: 'directorates-line',
          type: 'line',
          source: 'directorates',
          paint: { 'line-color': '#c9d6df', 'line-width': 1 },
        })
        const schoolFeatures = data.schools
          .filter((s) => s.latitude != null && s.longitude != null)
          .map((s) => ({
            type: 'Feature',
            properties: { id: s.id, value: s[metric] || 0 },
            geometry: { type: 'Point', coordinates: [s.longitude, s.latitude] },
          }))
        map.addSource('schools', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: schoolFeatures },
        })
        map.addLayer({
          id: 'school-points',
          type: 'circle',
          source: 'schools',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2, 12, 5],
            'circle-color': [
              'step',
              ['get', 'value'],
              '#64748b',
              1,
              '#4eb3d3',
              6,
              '#29a58b',
              21,
              '#edbd62',
            ],
            'circle-stroke-color': '#14101b',
            'circle-stroke-width': 1,
          },
        })
        map.on('click', 'school-points', (e) => {
          const row = data.schools.find(
            (s) => s.id === e.features[0].properties.id,
          )
          if (row) selectRef.current(row)
        })
        for (const d of data.directorates) {
          if (d.latitude == null || d.longitude == null) continue
          const button = document.createElement('button')
          button.type = 'button'
          button.className = 'statistics-map-label'
          button.textContent = `${isArabic ? d.name_ar : d.name_en} · ${d[metric] || 0}`
          button.style.borderColor = color(d[metric] || 0)
          button.addEventListener('click', () => selectRef.current(d))
          new maplibregl.Marker({ element: button })
            .setLngLat([d.longitude, d.latitude])
            .addTo(map)
        }
        if (
          data.directorates.length === 1 &&
          data.directorates[0].latitude != null
        )
          map.jumpTo({
            center: [
              data.directorates[0].longitude,
              data.directorates[0].latitude,
            ],
            zoom: 9,
          })
      })
      map.on('error', () => {
        if (!disposed)
          setError(
            isArabic
              ? 'تعذّر عرض بعض طبقات الخريطة. البيانات متاحة في الجدول.'
              : 'Some map layers could not load. Data remains available in the table.',
          )
      })
    } catch (e) {
      queueMicrotask(() => {
        if (!disposed) setError(e.message)
      })
    }
    return () => {
      disposed = true
      map?.remove()
    }
  }, [data, metric, isArabic])
  return (
    <>
      <div
        ref={host}
        className="statistics-map-canvas"
        aria-label={
          isArabic
            ? 'خريطة إحصائيات المدارس والمديريات'
            : 'School and directorate statistics map'
        }
      />
      {error && <p role="alert">{error}</p>}
    </>
  )
}
export default function MapPage() {
  const { data, error, reload } = usePlatformData('/map'),
    { isArabic, dir } = useLanguage(),
    [metric, setMetric] = useState('research'),
    [selected, setSelected] = useState(null),
    [q, setQ] = useState(''),
    t = (a, e) => (isArabic ? a : e)
  const metrics = [
    ['schools', 'المدارس المشاركة', 'Participating schools'],
    ['approved', 'الأعمال المقبولة', 'Approved work'],
    ['research', 'الأبحاث المقدّمة', 'Submitted research'],
    ['published', 'الأعمال المنشورة', 'Published work'],
    ['practices', 'الممارسات', 'Practices'],
    ['participations', 'مشاركات المؤتمر', 'Conference participations'],
    ['researchers', 'الباحثون المشاركون', 'Participating researchers'],
  ]
  return (
    <section className="statistics-map" dir={dir}>
      <header>
        <span>PARP / DATA</span>
        <h1>{t('خريطة المديريات والمدارس', 'Directorates & schools map')}</h1>
        <p>
          {t(
            'إحصائيات فعلية ضمن نطاق صلاحياتك. ألوان الخريطة تعبّر عن الأعداد، لا عن جودة التعليم.',
            'Actual statistics within your authorized scope. Map colors represent counts, not education quality.',
          )}
        </p>
      </header>
      {error && (
        <p role="alert">
          {error}
          <button onClick={reload}>{t('إعادة المحاولة', 'Retry')}</button>
        </p>
      )}
      <label>
        {t('المؤشر', 'Metric')}
        <select value={metric} onChange={(e) => setMetric(e.target.value)}>
          {metrics.map(([k, a, e]) => (
            <option key={k} value={k}>
              {t(a, e)}
            </option>
          ))}
        </select>
      </label>
      <div className="statistics-map-legend">
        {[
          [0, '0'],
          [1, '1–5'],
          [6, '6–20'],
          [21, '21+'],
        ].map(([n, label]) => (
          <span key={n}>
            <i style={{ background: color(n) }} />
            {label}
          </span>
        ))}
      </div>
      {!data && !error && <p role="status">{t('جارٍ التحميل…', 'Loading…')}</p>}
      {data && (
        <>
          <StatisticalCanvas
            data={data}
            metric={metric}
            isArabic={isArabic}
            onSelect={setSelected}
          />
          <p>
            {t(
              'مدارس دون إحداثيات موثّقة',
              'Schools without verified coordinates',
            )}
            :{' '}
            {
              data.schools.filter(
                (s) => s.latitude == null || s.longitude == null,
              ).length
            }
            .{' '}
            {t(
              'تظل في الجدول؛ لا نضع نقاطاً تخمينية.',
              'They remain in the table; no guessed points are placed.',
            )}
          </p>
          {selected && (
            <aside className="statistics-map-detail">
              <h2>{isArabic ? selected.name_ar : selected.name_en}</h2>
              {metrics.map(([k, a, e]) => (
                <p key={k}>
                  {t(a, e)}: {selected[k]}
                </p>
              ))}
              {selected.schools != null && (
                <p>
                  {t('المدارس المشاركة', 'Participating schools')}:{' '}
                  {selected.schools}
                </p>
              )}
              <button onClick={() => setSelected(null)}>
                {t('إغلاق', 'Close')}
              </button>
            </aside>
          )}
          <h2>{t('المديريات', 'Directorates')}</h2>
          <div className="statistics-map-directorates">
            {data.directorates.map((d) => (
              <button key={d.id} onClick={() => setSelected(d)}>
                {isArabic ? d.name_ar : d.name_en} · {d[metric]} ·{' '}
                {t('مدارس مشاركة', 'participating schools')}: {d.schools}
              </button>
            ))}
          </div>
          <label>
            {t('البحث عن مدرسة', 'Find a school')}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
            />
          </label>
          <div className="statistics-map-table">
            <table>
              <thead>
                <tr>
                  <th>{t('المدرسة', 'School')}</th>
                  <th>{t('المديرية', 'Directorate')}</th>
                  <th>{t('القيمة', 'Value')}</th>
                </tr>
              </thead>
              <tbody>
                {data.schools
                  .filter((s) =>
                    `${s.name_ar} ${s.name_en}`
                      .toLowerCase()
                      .includes(q.toLowerCase()),
                  )
                  .map((s) => (
                    <tr key={s.id}>
                      <td>
                        <button onClick={() => setSelected(s)}>
                          {isArabic ? s.name_ar : s.name_en}
                        </button>
                      </td>
                      <td>
                        {
                          data.directorates.find(
                            (d) => d.id === s.directorate_id,
                          )?.[isArabic ? 'name_ar' : 'name_en']
                        }
                      </td>
                      <td>{s[metric]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

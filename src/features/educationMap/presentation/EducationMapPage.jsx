import { useMemo, useState } from 'react'
import { useLanguage } from '../../../i18n/useLanguage.js'
import { RouteLink } from '../../../routing/clientRouter.jsx'
import {
  useDebouncedValue,
  useEducationData,
} from '../application/useEducationData.js'
import { queryString } from '../data/educationApi.js'
import {
  EMPTY_GEOJSON,
  hasCoordinates,
  localizedName,
  withSchoolCounts,
} from '../domain/geography.js'
import { mapStrings, schoolTypeLabel } from './strings.js'
import MapCanvas from './MapCanvas.jsx'
import './EducationMap.css'

const INITIAL_FILTERS = {
  q: '',
  region: '',
  governorate_id: '',
  directorate_id: '',
  school_type: '',
  location: 'all',
}
const normalize = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670ـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()

export default function EducationMapPage() {
  const { language, dir } = useLanguage()
  const copy = mapStrings[language]
  const [revision, setRevision] = useState(0)
  const catalog = useEducationData('/catalog', revision)
  const boundaries = useEducationData('/boundaries', revision)
  const directorates = useEducationData('/directorates/boundaries', revision)
  const error = catalog.error || boundaries.error || directorates.error
  const loading = catalog.loading || boundaries.loading || directorates.loading
  return (
    <section
      className="education-map"
      dir={dir}
      aria-labelledby="education-map-title"
    >
      <header className="education-map__heading">
        <div>
          <span className="education-map__eyebrow">PARP / {copy.eyebrow}</span>
          <h1 id="education-map-title">{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
        <RouteLink to="/observatory" className="education-map__text-link">
          {copy.observatory} <span aria-hidden="true">↗</span>
        </RouteLink>
      </header>
      {error ? (
        <div className="education-map__status" role="alert">
          <p>{copy.error}</p>
          <button onClick={() => setRevision((n) => n + 1)}>
            {copy.retry}
          </button>
        </div>
      ) : loading ? (
        <div className="education-map__status" role="status">
          {copy.loading}
        </div>
      ) : !catalog.data.governorates.length ? (
        <div className="education-map__status">{copy.noData}</div>
      ) : (
        <Directory
          catalog={catalog.data}
          boundaries={boundaries.data}
          directorateGeography={directorates.data}
          language={language}
          copy={copy}
        />
      )}
    </section>
  )
}

function Directory({
  catalog,
  boundaries,
  directorateGeography,
  language,
  copy,
}) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [page, setPage] = useState(0)
  const [tab, setTab] = useState('schools')
  const [revision, setRevision] = useState(0)
  const [schoolId, setSchoolId] = useState('')
  const [selectedDirectorate, setSelectedDirectorate] = useState(null)
  const [focus, setFocus] = useState(null)
  const [counts, setCounts] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(() => window.innerWidth > 720)
  const [viewport, setViewport] = useState(null)
  const q = useDebouncedValue(filters.q)
  const bounds = useDebouncedValue(viewport)
  const params = { ...filters, q }
  const schools = useEducationData(
    `/schools?${queryString({ ...params, offset: page * 25, limit: 25 })}`,
    revision,
  )
  const detail = useEducationData(
    schoolId ? `/schools/${encodeURIComponent(schoolId)}` : null,
    revision,
  )
  const points = useEducationData(
    bounds?.zoom >= 10
      ? `/schools/points?${queryString({ ...params, bbox: bounds.bbox })}`
      : null,
    revision,
  )
  const geography = useMemo(
    () => withSchoolCounts(boundaries, catalog.governorates),
    [boundaries, catalog.governorates],
  )
  const name = (item) => localizedName(item, language)
  const format = (value) =>
    new Intl.NumberFormat(language === 'ar' ? 'ar-PS' : 'en').format(value)
  const governorates = catalog.governorates.filter(
    (g) => !filters.region || g.region === filters.region,
  )
  const directorates = catalog.directorates.filter(
    (d) =>
      (!filters.region || d.region === filters.region) &&
      (!filters.governorate_id || d.governorate_id === filters.governorate_id),
  )
  const listedDirectorates = directorates.filter(
    (d) =>
      (!filters.directorate_id || d.id === filters.directorate_id) &&
      normalize(`${d.name_ar} ${d.name_en}`).includes(
        normalize(filters.q.trim()),
      ),
  )
  const currentDirectorate =
    selectedDirectorate ||
    catalog.directorates.find((d) => d.id === filters.directorate_id)
  const displayedSchool = detail.data
  const highlightedGovernorate =
    displayedSchool?.governorate_id ||
    currentDirectorate?.governorate_id ||
    filters.governorate_id
  const activeFocus = useMemo(
    () =>
      displayedSchool
        ? {
            school: displayedSchool,
            governorateId: displayedSchool.governorate_id,
          }
        : focus,
    [displayedSchool, focus],
  )

  function changeFilter(key, value) {
    setFilters((old) => ({
      ...old,
      [key]: value,
      ...(key === 'region'
        ? { governorate_id: '', directorate_id: '' }
        : key === 'governorate_id'
          ? { directorate_id: '' }
          : {}),
    }))
    setPage(0)
    setSchoolId('')
    setSelectedDirectorate(null)
    if (key === 'governorate_id')
      setFocus({ governorateId: value, reset: !value })
    if (key === 'directorate_id')
      setFocus({
        directorateId: value,
        governorateId: catalog.directorates.find((d) => d.id === value)
          ?.governorate_id,
      })
  }
  function chooseGovernorate(id) {
    setFilters((old) => ({
      ...old,
      governorate_id: id,
      directorate_id: '',
      region: catalog.governorates.find((g) => g.id === id)?.region || '',
    }))
    setPage(0)
    setSchoolId('')
    setSelectedDirectorate(null)
    setTab('schools')
    setFocus({ governorateId: id })
  }
  function chooseSchool(id) {
    setSchoolId(id)
    setSelectedDirectorate(null)
  }
  function chooseDirectorate(item) {
    setSelectedDirectorate(item)
    setSchoolId('')
    setFocus({ directorateId: item.id, governorateId: item.governorate_id })
  }
  function clear() {
    setFilters(INITIAL_FILTERS)
    setPage(0)
    setSchoolId('')
    setSelectedDirectorate(null)
    setFocus({ reset: true })
  }
  const field = (key, label, children) => (
    <label className="education-map__field" key={key}>
      <span>{label}</span>
      <select
        value={filters[key]}
        onChange={(e) => changeFilter(key, e.target.value)}
      >
        {children}
      </select>
    </label>
  )

  return (
    <>
      <div className="education-map__metrics">
        {[
          [catalog.total_schools, copy.records],
          [catalog.governorates.length, copy.governorates],
          [catalog.directorates.length, copy.directorates],
          [catalog.located_schools, copy.located],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>{format(value)}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="education-map__workspace">
        <aside className="education-map__directory" aria-label={copy.filters}>
          <div className="education-map__search">
            <label htmlFor="education-search">{copy.search}</label>
            <input
              id="education-search"
              type="search"
              maxLength={160}
              value={filters.q}
              placeholder={copy.searchHint}
              onChange={(e) => changeFilter('q', e.target.value)}
            />
          </div>
          <div className="education-map__tabs" aria-label={copy.filters}>
            {['schools', 'directorates'].map((value) => (
              <button
                key={value}
                aria-pressed={tab === value}
                onClick={() => {
                  setTab(value)
                  setSchoolId('')
                  setSelectedDirectorate(null)
                }}
              >
                {copy[value]}
              </button>
            ))}
          </div>
          <details
            className="education-map__filters"
            open={filtersOpen}
            onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
          >
            <summary>{copy.filters}</summary>
            <div className="education-map__filter-grid">
              {field(
                'region',
                copy.region,
                <>
                  <option value="">{copy.all}</option>
                  <option value="PS01">{copy.wb}</option>
                  <option value="PS02">{copy.gaza}</option>
                </>,
              )}
              {field(
                'governorate_id',
                copy.governorate,
                <>
                  <option value="">{copy.all}</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {name(g)}
                    </option>
                  ))}
                  <option value="unassigned">{copy.unknown}</option>
                </>,
              )}
              {field(
                'directorate_id',
                copy.directorate,
                <>
                  <option value="">{copy.all}</option>
                  {directorates.map((d) => (
                    <option key={d.id} value={d.id}>
                      {name(d)}
                    </option>
                  ))}
                  {tab === 'schools' && (
                    <option value="unassigned">{copy.unassigned}</option>
                  )}
                </>,
              )}
              {tab === 'schools' &&
                field(
                  'school_type',
                  copy.type,
                  <>
                    <option value="">{copy.all}</option>
                    {catalog.school_types.map((value) => (
                      <option key={value} value={value}>
                        {schoolTypeLabel(value, language)}
                      </option>
                    ))}
                  </>,
                )}
              {tab === 'schools' &&
                field(
                  'location',
                  copy.location,
                  <>
                    <option value="all">{copy.all}</option>
                    <option value="located">{copy.locatedOnly}</option>
                    <option value="missing">{copy.missingOnly}</option>
                  </>,
                )}
            </div>
            <button className="education-map__clear" onClick={clear}>
              {copy.clear}
            </button>
          </details>
          <div
            className="education-map__results"
            aria-live="polite"
            aria-busy={tab === 'schools' && schools.loading}
          >
            {tab === 'schools' ? (
              <>
                {schools.loading ? (
                  <p role="status">{copy.loading}</p>
                ) : schools.error ? (
                  <div role="alert">
                    <p>{copy.error}</p>
                    <button onClick={() => setRevision((n) => n + 1)}>
                      {copy.retry}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="education-map__result-count">
                      {format(schools.data.total)} {copy.results}
                    </p>
                    {!schools.data.items.length && (
                      <p>
                        {currentDirectorate &&
                        !currentDirectorate.linked_school_count
                          ? copy.noLinks
                          : copy.empty}
                      </p>
                    )}
                    <ul>
                      {schools.data.items.map((school) => (
                        <li key={school.id}>
                          <button
                            className={`education-map__record${schoolId === school.id ? ' is-selected' : ''}`}
                            onClick={() => chooseSchool(school.id)}
                          >
                            <strong dir="auto">{name(school)}</strong>
                            <span>
                              {name(
                                catalog.governorates.find(
                                  (g) => g.id === school.governorate_id,
                                ),
                              ) || copy.unknown}{' '}
                              · {schoolTypeLabel(school.school_type, language)}
                            </span>
                            <small>
                              {hasCoordinates(school)
                                ? copy.locatedOnly
                                : copy.missingOnly}
                            </small>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <nav
                      className="education-map__pagination"
                      aria-label={copy.page}
                    >
                      <button
                        disabled={page === 0}
                        onClick={() => setPage((n) => n - 1)}
                      >
                        {copy.prev}
                      </button>
                      <span>
                        {copy.page} {format(page + 1)}
                      </span>
                      <button
                        disabled={(page + 1) * 25 >= schools.data.total}
                        onClick={() => setPage((n) => n + 1)}
                      >
                        {copy.next}
                      </button>
                    </nav>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="education-map__result-count">
                  {format(listedDirectorates.length)} {copy.results}
                </p>
                {!listedDirectorates.length && <p>{copy.empty}</p>}
                <ul>
                  {listedDirectorates.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`education-map__record${currentDirectorate?.id === item.id ? ' is-selected' : ''}`}
                        onClick={() => chooseDirectorate(item)}
                      >
                        <strong>{name(item)}</strong>
                        <span>
                          {name(
                            catalog.governorates.find(
                              (g) => g.id === item.governorate_id,
                            ),
                          ) ||
                            (item.region === 'PS02'
                              ? copy.gaza
                              : copy.ministry)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
        <div className="education-map__visual">
          <div className="education-map__toolbar">
            <span>{copy.hint}</span>
            <label>
              <input
                type="checkbox"
                checked={counts}
                onChange={(e) => setCounts(e.target.checked)}
              />
              {copy.counts}
            </label>
          </div>
          <MapCanvas
            key={language}
            geography={geography}
            directorateGeography={directorateGeography}
            points={points.data || EMPTY_GEOJSON}
            language={language}
            copy={copy}
            counts={counts}
            focus={activeFocus}
            selectedSchool={schoolId}
            selectedDirectorate={currentDirectorate?.id}
            selectedGovernorate={highlightedGovernorate}
            onDirectorate={(id) => {
              const item = catalog.directorates.find((d) => d.id === id)
              if (item) chooseDirectorate(item)
            }}
            onGovernorate={chooseGovernorate}
            onSchool={chooseSchool}
            onViewport={setViewport}
          />
          <div className="education-map__map-footer">
            {counts ? (
              <div className="education-map__legend">
                <span>{copy.legend}</span>
                <i />
                <span>
                  {format(0)} —{' '}
                  {format(
                    Math.max(
                      0,
                      ...catalog.governorates.map((g) => g.school_count),
                    ),
                  )}
                </span>
              </div>
            ) : (
              <span>{copy.schoolHint}</span>
            )}
            <span>{copy.loaded}</span>
          </div>
          {points.error && (
            <p className="education-map__notice" role="alert">
              {copy.pointError}{' '}
              <button onClick={() => setRevision((n) => n + 1)}>
                {copy.retry}
              </button>
            </p>
          )}
          {points.data?.truncated && (
            <p className="education-map__notice">{copy.truncated}</p>
          )}
          {(schoolId || currentDirectorate) && (
            <section
              className="education-map__detail"
              aria-label={copy.details}
              aria-live="polite"
            >
              <button
                className="education-map__detail-close"
                aria-label={copy.close}
                onClick={() => {
                  setSchoolId('')
                  setSelectedDirectorate(null)
                  if (filters.directorate_id) changeFilter('directorate_id', '')
                }}
              >
                ×
              </button>
              {schoolId ? (
                detail.loading ? (
                  <p>{copy.loading}</p>
                ) : detail.error ? (
                  <p role="alert">
                    {copy.error}{' '}
                    <button onClick={() => setRevision((n) => n + 1)}>
                      {copy.retry}
                    </button>
                  </p>
                ) : (
                  <>
                    <span className="education-map__eyebrow">
                      {copy.details}
                    </span>
                    <h2 dir="auto">{name(displayedSchool)}</h2>
                    <dl>
                      <dt>{copy.nationalCode}</dt>
                      <dd>{displayedSchool.national_code || copy.unknown}</dd>
                      <dt>{copy.governorate}</dt>
                      <dd>
                        {name(
                          catalog.governorates.find(
                            (g) => g.id === displayedSchool.governorate_id,
                          ),
                        ) || copy.unknown}
                      </dd>
                      <dt>{copy.directorate}</dt>
                      <dd>
                        {name(
                          catalog.directorates.find(
                            (d) => d.id === displayedSchool.directorate_id,
                          ),
                        ) || copy.unassigned}
                      </dd>
                    </dl>
                    {!hasCoordinates(displayedSchool) && (
                      <p>{copy.noLocation}</p>
                    )}
                    {!displayedSchool.directorate_id && (
                      <p>{copy.noDirectorate}</p>
                    )}
                    {hasCoordinates(displayedSchool) && (
                      <div className="education-map__coordinate-details">
                        <dl>
                          <dt>{copy.coordinates}</dt>
                          <dd dir="ltr">
                            {displayedSchool.latitude.toFixed(6)}, {displayedSchool.longitude.toFixed(6)}
                          </dd>
                        </dl>
                        <strong>{copy.coordinateSource}</strong>
                        <p dir="auto">{displayedSchool.coordinate_source}</p>
                      </div>
                    )}
                  </>
                )
              ) : (
                <>
                  <span className="education-map__eyebrow">
                    {copy.directorate}
                  </span>
                  <h2>{name(currentDirectorate)}</h2>
                  <p>
                    {currentDirectorate.linked_school_count
                      ? `${copy.linked}: ${format(currentDirectorate.linked_school_count)}`
                      : copy.noLinks}
                  </p>
                  {!currentDirectorate.has_boundary && (
                    <p>
                      {currentDirectorate.governorate_id
                        ? copy.noBoundary
                        : copy.noBoundaryUnassigned}
                    </p>
                  )}
                  <a
                    href={currentDirectorate.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {copy.official} ↗
                  </a>
                  {currentDirectorate.governorate_id && (
                    <button
                      onClick={() =>
                        chooseGovernorate(currentDirectorate.governorate_id)
                      }
                    >
                      {copy.showGovernorate}
                    </button>
                  )}
                </>
              )}
            </section>
          )}
          <div className="education-map__notice">
            <span aria-hidden="true">ⓘ</span>
            <p>
              <strong>
                {copy.locationCoverage}: {format(catalog.located_schools)} / {format(catalog.total_schools)}.
              </strong>{' '}
              {copy.locationNote}
              {catalog.unassigned_governorate_schools > 0 && (
                <>
                  {' '}
                  {copy.unmappedRecords}:{' '}
                  {format(catalog.unassigned_governorate_schools)}.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      <footer className="education-map__sources">
        <a href={catalog.ministry.url} target="_blank" rel="noreferrer">
          {copy.ministry} ↗
        </a>
        <p>{copy.sourceNote}</p>
        <p>{copy.directoryNote}</p>
        <div className="education-map__coordinate-sources" aria-label={copy.coordinateSources}>
          <a href="https://data.humdata.org/dataset/state-of-palestine-west-bank-schools" target="_blank" rel="noreferrer">
            {copy.wbLocationSource} ↗
          </a>
          <a href="https://data.humdata.org/dataset/hotosm_pse_education_facilities" target="_blank" rel="noreferrer">
            {copy.osmLocationSource} ↗
          </a>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap / ODbL 1.0 ↗</a>
          <a href={`${import.meta.env.BASE_URL}data/school-locations-osm.geojson`} download>
            {copy.osmDownload} ↓
          </a>
        </div>
      </footer>
    </>
  )
}

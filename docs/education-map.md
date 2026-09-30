# Directory map and National Observatory

## Routes

- `/map`: **Directorates & schools map / خريطة المديريات والمدارس**, linked in the sidebar's Data & Impact group and registered in bilingual platform search.
- `/observatory`: real governorate map replaces the map placeholder; remaining overview cards are preserved.
- `/observatory/map`: the same research-map shell. Research indicators have a clear pending-data state. No school counts are passed off as research/problem metrics.

Both map routes follow the platform's existing protected-route policy and require sign-in. Requests reuse `features/auth/authApi.js`, including its bearer token and refresh flow; no second token store or API-origin setting is introduced. The route guard also avoids rendering protected pages before redirecting an unauthenticated visitor. The existing AuthContext object was moved into `authContext.js` to resolve the new Fast Refresh lint error without changing authentication behavior.

The active routes do not import `demoDirectorates`, `demoSchools`, or the old fake boundary rectangles. Legacy map components are retained for compatibility but no longer used by these routes. Three pre-existing lint errors in those legacy components were corrected without changing their behavior.

## Run

Apply the paired backend patch and import its data first. From this frontend root:

```powershell
npm ci
npm run dev
```

The map uses the current `VITE_API_URL` setting (default `http://localhost:8000`) through the same authenticated client as the profile/login features. No additional JavaScript dependency is introduced: the repository already includes MapLibre GL JS 4.7.1. The map code is lazy-loaded; the approximately 216 KB gzip MapLibre/map chunk is loaded when a map route is opened, not on the home page.

For production, keep `VITE_API_URL` pointed at the deployed backend and `FRONTEND_ORIGIN` set to the deployed UI origin, as in the existing auth setup. API credentials must stay out of Vite variables. Configure SPA fallback for direct `/map` links. Existing `.env`, `.env.example`, Vite configuration, authentication API, login/profile pages, header, partner assets, SMTP/MinIO/OpenAI configuration and routes are retained.

## Structure

- `features/educationMap/data/educationApi.js`: fetch, cancellation, timeout, query serialization.
- `application/useEducationData.js`: request lifecycle, stale-response isolation and search/view debounce.
- `domain/geography.js`: real-geometry bounds, verified-coordinate checks, translated-name fallback, data-driven school counts.
- `presentation/EducationMapPage.jsx`: directory/search/filter/detail experience using API data.
- `presentation/MapCanvas.jsx`: reusable MapLibre lifecycle and governorate/directorate/school layers, clusters, camera, hover and selection.
- `presentation/strings.js`, `EducationMap.css`: bilingual copy and scoped responsive styling.
- `features/observatory/ObservatoryMap.jsx`: separate research-data waiting state using the shared map canvas.

## Data behavior

The 3094 school records are paginated in the API, not bundled into React. Search accepts Arabic and English names, governorate names, and national codes. Directorate search is available in its own tab. School filters apply on the server; point requests use the current viewport only at zoom 10+, and clusters expand on selection. Reduced-motion preference suppresses animated map camera movement. Missing translations fall back to the supplied source name rather than invented translated institution names.

A school's missing location remains missing. Selecting it displays details and may frame its **governorate**, explicitly stating that this is not its precise location. Directorate entries without verified school membership show a missing-link explanation rather than claiming they have zero schools. Only verified directorate geometry returned by the API is rendered at closer zoom. Governorates are never relabelled as educational directorates.

The optional color layer depicts **all stored school records by governorate**, independent of the directory filters. Its legend states this scope and the actual scale maximum. Unassigned-governorate records remain searchable and are disclosed below the map; they are not forced into a polygon. No research indicators are fabricated. No third-party basemap, map token, or geocoding request is used.

## Validation and remaining manual checks

Automated checks run: `npm run lint`, `npm test` (13 tests), `npm run build`. Authenticated catalog, geometry, search and point endpoints were tested against the seeded FastAPI application using its existing verified-user/JWT dependency. Anonymous/invalid-token requests returned 401. Backend tests are documented separately.

The headless browser terminated before opening a page in this execution environment, so **visual layout, live WebGL rendering, touch interaction and browser clustering were not verified here**. Before publishing:

1. Sign in with an existing verified account, then open sidebar → map, then `/observatory`; confirm distinct directory/research experiences and preserved theme/header/footer.
2. Switch Arabic/English. Search `نابلس`, `Nablus`, a school name and a national code. Confirm text direction, filter labels, pagination and detail panels.
3. Select a governorate by dropdown and map click. Toggle school-record colors; confirm the all-record scope and numeric legend.
4. Open the Directorate tab and select a record. Missing school membership/boundaries must be described, never guessed.
5. Select any seed school. No school marker should appear, because seed coordinates are all null. For verified enriched records only, check points inside the viewport at zoom 10+, cluster expansion, selection and popup text.
6. Check widths 390, 768 and 1440 pixels; filters collapse on mobile, directory remains keyboard-accessible, zoom controls remain usable, no horizontal overflow.
7. Check loading/API-offline and WebGL-disabled states. With WebGL disabled, the school/directorate directory must remain usable.
8. Enable reduced motion and verify camera changes are immediate. Tab through filter controls, results, pagination and zoom buttons.

The build reports the standard MapLibre chunk-size warning. The map is deliberately lazy-loaded; no claim of load testing at national-scale concurrency is made.

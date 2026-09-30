# Historical Palestine reference outline

Incremental frontend update on top of the delivered `PARP-map-frontend-44cb3fb.patch`. No backend schema, authentication, school records or directorate links are changed.

Source: Geomolg, HistoricalPalestine_02, layer 3 (`Historical Palestine | فلسطين التاريخية`).

https://orthophotos.geomolg.ps/adaptor/rest/services/HistoricalPalestine_02/MapServer/3

Downloaded 2026-10-01 (Asia/Jerusalem). The source layer also contains neighbours and seas. Only the three features tagged `Palestine`, `West Bank`, and `Gaza Strip` were requested. All three are required because the source represents the West Bank and Gaza separately from the feature named `Palestine`. No neighbouring-country, Golan Heights, or sea features were included. The downloaded snapshot is a geographic reference layer, not a claim about present administrative jurisdictions or data coverage.

Query: `https://orthophotos.geomolg.ps/adaptor/rest/services/HistoricalPalestine_02/MapServer/3/query?where=LayerName_English+IN+%28%27Palestine%27%2C%27West+Bank%27%2C%27Gaza+Strip%27%29&outFields=OBJECTID%2CCountryName_Arabic%2CCountryName_English%2CLayerName_English&returnGeometry=true&outSR=4326&f=geojson`

The server transforms its native EPSG:28191 geometry to WGS84 (outSR=4326). GeoJSON coordinate sequences are retained exactly as returned; there is no manual tracing or invented boundary. Download SHA-256: `8420b45a8b65414da1588c9e07a8fc38da5ad1daf698150afc0e05efed6cb6a7`.

The GeoJSON is served as a separate local Vite asset rather than embedded in the JavaScript bundle. Visitors do not request geometry from the remote GIS service at runtime. Source attribution remains visible in Arabic and English. The initial view, Reset view control, and Clear filters overview fit the full source extent. Governorate selection and verified-school focus retain their existing behavior.

The shared MapCanvas displays this background in the directory and the Observatory. Current directory/statistical coverage stays limited to the supplied West Bank/Gaza records. No school location is added by this patch.

Validation: source types, WGS84 coordinate ranges, closed polygon rings, derived extent and inclusion of all three source features checked. Lint/build and incremental LF/CRLF patch application checked. Browser/WebGL visual inspection remains to be performed on the user's device because the headless browser could not start in this execution environment.

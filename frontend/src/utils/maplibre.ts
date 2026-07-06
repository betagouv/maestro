import * as maplibregl from 'maplibre-gl';
// See https://github.com/maplibre/maplibre-gl-js/issues/7339.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

export { maplibregl };

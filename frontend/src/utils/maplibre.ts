import * as maplibregl from 'maplibre-gl';
// https://maplibre.org/maplibre-gl-js/docs/#vite.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

maplibregl.setWorkerUrl(maplibreWorkerUrl);

export { maplibregl };

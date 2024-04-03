import type { FeatureCollection } from 'geojson';
import _ from 'lodash';
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import Map, {
  CircleLayer,
  FillLayer,
  GeolocateControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  SymbolLayer,
} from 'react-map-gl/maplibre';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { RegionList, Regions } from 'shared/schema/Region';
import { useGetRegionsGeoJsonQuery } from 'src/services/region.service';

interface Props {
  prescriptions: Prescription[];
}

const PrescriptionMap = ({ prescriptions }: Props) => {
  const { data: regionsSource } = useGetRegionsGeoJsonQuery();

  const regionsData: FeatureCollection = {
    type: 'FeatureCollection',
    features: RegionList.map((region) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          Regions[region].center.longitude,
          Regions[region].center.latitude,
        ],
      },
      properties: {
        title: Regions[region].name,
        sampleCount: _.sumBy(
          prescriptions.filter(
            (prescription) => prescription.region === region
          ),
          'sampleCount'
        ),
      },
    })),
  };

  const centerCircleLayer: CircleLayer = {
    id: 'center-circle',
    type: 'circle',
    source: 'centers',
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'sampleCount'],
        10,
        10,
        100,
        20,
      ],
      'circle-color': '#000091',
      'circle-opacity': 1,
    },
  };

  const centerCountLayer: SymbolLayer = {
    id: 'center-count',
    type: 'symbol',
    source: 'centers',
    layout: {
      'text-field': ['get', 'sampleCount'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#ffffff',
      'text-opacity': 1,
    },
  };

  const regionsLayer: FillLayer = {
    id: 'regions',
    type: 'fill',
    source: 'mapbox',
    paint: {
      'fill-color': '#6a6af4',
      'fill-opacity': 0.5,
    },
  };

  const mapStyle: StyleSpecification = {
    version: 8,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: 'https://openmaptiles.geo.data.gouv.fr/data/france-vector.json',
      },
    },
    glyphs:
      'https://openmaptiles.geo.data.gouv.fr/fonts/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#f8f4f0' },
      },
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': 'hsl(210, 67%, 85%)' },
      },
    ],
  };

  return (
    <div data-testid="prescription-map">
      <Map
        attributionControl
        id="prescriptionMap"
        initialViewState={{
          latitude: 47,
          longitude: 2,
          zoom: 4.5,
        }}
        maxZoom={5}
        minZoom={1}
        style={{
          minHeight: 'calc(100vh - 200px)',
          maxWidth: '100%',
          fontFamily: 'Marianne, sans-serif',
        }}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        reuseMaps
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {regionsSource && (
          <>
            <Source type="geojson" data={regionsSource}>
              <Layer {...regionsLayer} />
            </Source>
            <Source id="centers" type="geojson" data={regionsData}>
              <Layer {...centerCircleLayer} />
              <Layer {...centerCountLayer} />
            </Source>
          </>
        )}
      </Map>
    </div>
  );
};

export default PrescriptionMap;

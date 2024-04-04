import type { FeatureCollection } from 'geojson';
import _ from 'lodash';
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import { useRef } from 'react';
import Map, {
  CircleLayer,
  FillLayer,
  Layer,
  NavigationControl,
  Source,
  SymbolLayer,
} from 'react-map-gl/maplibre';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { Region, RegionList, Regions } from 'shared/schema/Region';
import { useGetRegionsGeoJsonQuery } from 'src/services/region.service';

interface Props {
  prescriptions: Prescription[];
}

const PrescriptionMap = ({ prescriptions }: Props) => {
  const ref = useRef<any>();
  const hoveredRegion = useRef<Region>();

  const { data: regions } = useGetRegionsGeoJsonQuery();

  const regionCenters: FeatureCollection = {
    type: 'FeatureCollection',
    features: RegionList.map((region) => ({
      type: 'Feature',
      id: region,
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
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0,
        1,
      ],
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
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0.5,
      ],
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
    ],
  };

  const onHover = (e: maplibregl.MapLayerMouseEvent) => {
    if (hoveredRegion.current) {
      ref.current.setFeatureState(
        { source: 'regions', id: hoveredRegion.current },
        { hover: false }
      );
      ref.current.setFeatureState(
        { source: 'centers', id: hoveredRegion.current },
        { hover: false }
      );
    }
    if (e.features && e.features.length > 0) {
      hoveredRegion.current = e.features[0].id as Region;
      ref.current.setFeatureState(
        { source: 'regions', id: e.features[0].id },
        { hover: true }
      );
      ref.current.setFeatureState(
        { source: 'centers', id: e.features[0].id },
        { hover: true }
      );
    }
  };

  return (
    <div data-testid="prescription-map">
      <Map
        ref={ref}
        attributionControl
        id="prescriptionMap"
        initialViewState={{
          latitude: 46,
          longitude: 2,
          zoom: 4.5,
        }}
        maxZoom={5}
        minZoom={4.5}
        scrollZoom={false}
        dragPan={false}
        style={{
          minHeight: 520,
          minWidth: 600,
          maxWidth: '50%',
          fontFamily: 'Marianne, sans-serif',
        }}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        reuseMaps
        interactiveLayerIds={['regions']}
        onMouseMove={onHover}
      >
        <NavigationControl position="top-left" showCompass={false} />
        {regions && (
          <>
            <Source id="regions" type="geojson" data={regions}>
              <Layer {...regionsLayer} />
            </Source>
            <Source id="centers" type="geojson" data={regionCenters}>
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

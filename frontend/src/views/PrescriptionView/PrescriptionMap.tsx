import type { FeatureCollection } from 'geojson';
import _ from 'lodash';
import maplibregl, {
  MapGeoJSONFeature,
  Point,
  StyleSpecification,
} from 'maplibre-gl';
import { useMemo, useRef, useState } from 'react';
import Map, {
  CircleLayer,
  FillLayer,
  Layer,
  Source,
  SymbolLayer,
} from 'react-map-gl/maplibre';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import { Region, RegionList, Regions } from 'shared/schema/Region';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useGetRegionsGeoJsonQuery } from 'src/services/region.service';

interface Props {
  prescriptions: Prescription[];
}

const PrescriptionMap = ({ prescriptions }: Props) => {
  const ref = useRef<any>();
  const userRegion = useAuthentication().userInfos?.region;
  const [hoverInfo, setHoverInfo] = useState<{
    feature: MapGeoJSONFeature;
    position: Point;
  }>();

  const { data: regions } = useGetRegionsGeoJsonQuery();

  const getSampleCount = (region: Region) =>
    _.sumBy(
      prescriptions.filter((prescription) => prescription.region === region),
      'sampleCount'
    );

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
        sampleCount: getSampleCount(region),
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
        ['case', ['==', ['get', 'code'], userRegion ?? ''], 0.8, 0.5],
      ],
    },
  };

  const mapStyle: StyleSpecification = useMemo(
    () => ({
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
    }),
    []
  );

  const hoveredRegion = useMemo(() => {
    return String(hoverInfo?.feature.id).padStart(2, '0') as Region;
  }, [hoverInfo]);

  const onHover = (e: maplibregl.MapLayerMouseEvent) => {
    if (hoverInfo?.feature) {
      ref.current.setFeatureState(
        { source: 'regions', id: hoverInfo.feature.id },
        { hover: false }
      );
      ref.current.setFeatureState(
        { source: 'centers', id: hoverInfo.feature.id },
        { hover: false }
      );
    }
    if (e.features && e.features.length > 0) {
      setHoverInfo({
        feature: e.features[0],
        position: e.point,
      });
      ref.current.setFeatureState(
        { source: 'regions', id: e.features[0].id },
        { hover: true }
      );
      ref.current.setFeatureState(
        { source: 'centers', id: e.features[0].id },
        { hover: true }
      );
    } else {
      setHoverInfo(undefined);
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
        interactiveLayerIds={['regions']}
        onMouseMove={onHover}
        cursor="pointer"
      >
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
        {hoverInfo?.feature && (
          <div
            className="fr-tooltip fr-placement fr-tooltip--shown"
            style={{
              left: hoverInfo.position.x,
              top: hoverInfo.position.y,
              position: 'absolute',
              margin: 8,
              padding: 4,
              background: 'white',
              pointerEvents: 'none',
            }}
          >
            <div>{Regions[hoveredRegion].name}</div>
            <div>{getSampleCount(hoveredRegion)} prélevements</div>
          </div>
        )}
      </Map>
    </div>
  );
};

export default PrescriptionMap;

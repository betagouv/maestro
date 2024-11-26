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
  LineLayer,
  Source,
  SymbolLayer,
} from 'react-map-gl/maplibre';
import { useNavigate } from 'react-router-dom';
import { Region, RegionList, Regions } from 'shared/referential/Region';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  getCompletionRate,
  RegionalPrescription,
} from 'shared/schema/RegionalPrescription/RegionalPrescription';
import { useGetRegionsGeoJsonQuery } from 'src/services/region.service';

interface Props {
  programmingPlan: ProgrammingPlan;
  regionalPrescriptions: RegionalPrescription[];
}

const ProgrammingPlanMap = ({
  programmingPlan,
  regionalPrescriptions,
}: Props) => {
  const ref = useRef<any>();
  const navigate = useNavigate();

  const [hoverInfo, setHoverInfo] = useState<{
    feature: MapGeoJSONFeature;
    position: Point;
  }>();

  const { data: regions } = useGetRegionsGeoJsonQuery();

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

  if (!regions || !regionalPrescriptions) {
    return <></>;
  }

  const getSampleCount = (region: Region) =>
    _.sumBy(
      regionalPrescriptions.filter(
        (regionalPrescription) => regionalPrescription.region === region
      ),
      'sampleCount'
    );

  const getRealizedSampleCount = (region: Region) =>
    _.sumBy(
      regionalPrescriptions.filter(
        (regionalPrescription) => regionalPrescription.region === region
      ),
      'realizedSampleCount'
    );

  const addRegionProperties = (featureCollection: any) => ({
    ...featureCollection,
    features: featureCollection.features.map((feature: any) => {
      const region = feature.id as Region;

      return region
        ? {
            ...feature,
            properties: {
              ...feature.properties,
              title: Regions[region].name,
              sampleCount: getSampleCount(region),
              realizedSampleCount: getRealizedSampleCount(region),
              completionRate: getCompletionRate(regionalPrescriptions, region),
            },
          }
        : feature;
    }),
  });

  const regionCenters: FeatureCollection = addRegionProperties({
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
        id: region,
      },
    })),
  });

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

  const regionsFillLayer: FillLayer = {
    id: 'regions-fill',
    type: 'fill',
    source: 'mapbox',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        '#000091',
        '#6a6af4',
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        ['interpolate', ['linear'], ['get', 'completionRate'], 5, 0.1, 95, 1],
      ],
    },
  };

  const regionsLineLayer: LineLayer = {
    id: 'regions-line',
    type: 'line',
    source: 'mapbox',
    paint: {
      'line-color': '#000091',
      'line-width': 0.1,
    },
  };

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

  const onClick = (e: maplibregl.MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      navigate(
        `/prescriptions/${programmingPlan.year}?region=${hoveredRegion}`
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
          zoom: 4,
        }}
        scrollZoom={false}
        dragPan={false}
        style={{
          minHeight: 400,
          fontFamily: 'Marianne, sans-serif',
        }}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        interactiveLayerIds={['regions-fill']}
        onMouseMove={onHover}
        onClick={onClick}
        cursor="pointer"
      >
        {regions && (
          <>
            <Source
              id="regions"
              type="geojson"
              data={addRegionProperties(regions)}
            >
              <Layer {...regionsFillLayer} />
              <Layer {...regionsLineLayer} />
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
            <div>{getRealizedSampleCount(hoveredRegion)} réalisés</div>
            <div>
              Taux de réalisation :{' '}
              {getCompletionRate(regionalPrescriptions, hoveredRegion)}%
            </div>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 5,
            left: 15,
          }}
        >
          Taux de réalisation
          <div
            style={{
              height: 15,
              width: 110,
              color: 'white',
              background: 'linear-gradient(90deg, #ebe7f0, #6a6af4)',
            }}
          ></div>
          <span>1</span>
          <span style={{ float: 'right' }}>100</span>
        </div>
      </Map>
    </div>
  );
};

export default ProgrammingPlanMap;

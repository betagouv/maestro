import { Geolocation } from 'maestro-shared/schema/Sample/Sample';
import maplibregl from 'maplibre-gl';
import { FunctionComponent, useEffect, useState } from 'react';
import {
  FullscreenControl,
  Map,
  Marker,
  MarkerDragEvent,
  NavigationControl
} from 'react-map-gl/maplibre';
import { assert, type Equals } from 'tsafe';
import config from '../../utils/config';

type ViewStyle = 'map' | 'satellite';

const ViewStyles: Record<ViewStyle, string | undefined> = {
  map: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
  satellite: config.satelliteStyle
};

type Props = {
  location?: Geolocation;
  mapZoom?: number;
  markerX: number;
  markerY: number;
} & (
  | {
      markerDraggable: true;
      onMarkerDragEnd: (event: MarkerDragEvent) => void;
    }
  | {
      markerDraggable?: never;
      onMarkerDragEnd?: never;
    }
);
export const SampleMap: FunctionComponent<Props> = ({
  location,
  mapZoom: initialZoom,
  markerX,
  markerY,
  markerDraggable,
  onMarkerDragEnd,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [mapLatitude, setMapLatitude] = useState<number>(
    location ? location.x : markerX
  );
  const [mapLongitude, setMapLongitude] = useState<number>(
    location ? location.y : markerY
  );
  const [mapZoom, setMapZoom] = useState<number>(initialZoom ?? 15);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('map');
  const [isSecondaryMapHovered, setIsSecondaryMapHovered] = useState(false);

  useEffect(() => {
    if (location) {
      setMapLatitude(location.x);
      setMapLongitude(location.y);
    }
  }, [location]);

  useEffect(() => {
    if (initialZoom) {
      setMapZoom(initialZoom);
    }
  }, [initialZoom]);

  return (
    <Map
      attributionControl={false}
      id="sampleLocationMap"
      latitude={mapLatitude}
      longitude={mapLongitude}
      zoom={mapZoom}
      mapLib={maplibregl}
      mapStyle={ViewStyles[viewStyle]}
      onZoom={(e) => setMapZoom(e.viewState.zoom)}
      onMove={(e) => {
        setMapLatitude(e.viewState.latitude);
        setMapLongitude(e.viewState.longitude);
      }}
      style={{
        minHeight: 375,
        aspectRatio: '1/1',
        height: 'calc(100% - 80px)'
      }}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <FullscreenControl position="bottom-right" />
      <Marker
        longitude={markerY}
        latitude={markerX}
        anchor="bottom"
        draggable={markerDraggable}
        onDragEnd={onMarkerDragEnd}
      />
      {ViewStyles['satellite'] && (
        <Map
          attributionControl={false}
          id="sampleLocationMapLayer"
          latitude={mapLatitude}
          longitude={mapLongitude}
          zoom={mapZoom}
          scrollZoom={false}
          dragPan={false}
          doubleClickZoom={false}
          style={{
            height: 50,
            width: 50,
            margin: 10,
            borderRadius: 5,
            border: `white solid ${isSecondaryMapHovered ? '2px' : '1px'}`,
            bottom: 0,
            position: 'absolute',
            cursor: 'grab'
          }}
          mapLib={maplibregl}
          mapStyle={ViewStyles[viewStyle === 'map' ? 'satellite' : 'map']}
          onClick={(e) => {
            e.preventDefault();
            setViewStyle(viewStyle === 'map' ? 'satellite' : 'map');
          }}
          onMouseOver={() => setIsSecondaryMapHovered(true)}
          onMouseOut={() => setIsSecondaryMapHovered(false)}
        />
      )}
    </Map>
  );
};

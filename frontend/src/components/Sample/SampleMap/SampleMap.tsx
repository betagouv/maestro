import type { Geolocation } from 'maestro-shared/schema/Geolocation/Geolocation';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  FullscreenControl,
  GeolocateControl,
  Map as MapLibre,
  type MapMouseEvent,
  type MapRef,
  Marker,
  type MarkerDragEvent,
  NavigationControl
} from 'react-map-gl/maplibre';
import { assert, type Equals } from 'tsafe';
import config from '../../../utils/config';
import { maplibregl } from '../../../utils/maplibre';

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
      onMarkerLocationUpdate: (event: MarkerDragEvent | MapMouseEvent) => void;
      onGeolocate: (coords: { latitude: number; longitude: number }) => void;
      onGeolocateUnavailable: () => void;
    }
  | {
      markerDraggable?: never;
      onMarkerLocationUpdate?: never;
      onGeolocate?: never;
      onGeolocateUnavailable?: never;
    }
);
export const SampleMap: FunctionComponent<Props> = ({
  location,
  mapZoom: initialZoom,
  markerX,
  markerY,
  markerDraggable,
  onMarkerLocationUpdate,
  onGeolocate,
  onGeolocateUnavailable,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const mapRef = useRef<MapRef>(null);

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

  const disableGeolocateButton = () => {
    const geolocateButton = mapRef.current
      ?.getContainer()
      .querySelector<HTMLButtonElement>('.maplibregl-ctrl-geolocate');

    if (geolocateButton) {
      geolocateButton.disabled = true;
      geolocateButton.setAttribute(
        'aria-label',
        'Position indisponible. Placez le repère manuellement sur la carte.'
      );
    }
    onGeolocateUnavailable?.();
  };

  return (
    <MapLibre
      ref={mapRef}
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
      onClick={onMarkerLocationUpdate}
      style={{
        minHeight: 375,
        aspectRatio: '1/1',
        height: 'calc(100% - 80px)'
      }}
    >
      <NavigationControl position="bottom-right" showCompass={false} />
      <FullscreenControl position="bottom-right" />
      {markerDraggable && (
        <GeolocateControl
          position="bottom-right"
          trackUserLocation={false}
          showUserLocation={false}
          positionOptions={{ enableHighAccuracy: true }}
          fitBoundsOptions={{ maxZoom: 15 }}
          onGeolocate={(e) =>
            onGeolocate({
              latitude: e.coords.latitude,
              longitude: e.coords.longitude
            })
          }
          onError={disableGeolocateButton}
        />
      )}
      <Marker
        longitude={markerY}
        latitude={markerX}
        draggable={markerDraggable}
        onDragEnd={onMarkerLocationUpdate}
      />
      {ViewStyles['satellite'] && (
        <MapLibre
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
    </MapLibre>
  );
};

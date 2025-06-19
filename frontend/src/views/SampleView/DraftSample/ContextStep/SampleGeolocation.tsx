import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Geolocation } from 'maestro-shared/schema/Sample/Sample';
import { useMemo, useState } from 'react';
import { MarkerDragEvent } from 'react-map-gl/maplibre';
import AddressSearch from 'src/components/AddressSearch/AddressSearch';
import { SampleMap } from '../../../../components/SampleMap/SampleMap';

interface Props {
  location?: Geolocation;
  onLocationChange: (coordinates: Geolocation) => void;
}

const SampleGeolocation = ({ location, onLocationChange }: Props) => {
  const [mapLatitude, setMapLatitude] = useState<number>(
    location ? location.x : 46
  );
  const [mapLongitude, setMapLongitude] = useState<number>(
    location ? location.y : 2.3522
  );
  const [mapZoom, setMapZoom] = useState<number>(location ? 15 : 5);

  const marker = useMemo(() => {
    return (
      location ?? {
        x: 46,
        y: 2.3522
      }
    );
  }, [location]);

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    onLocationChange({
      x: Number(event.lngLat.lat.toFixed(6)),
      y: Number(event.lngLat.lng.toFixed(6))
    });
  };

  return (
    <>
      <div className={clsx(cx('fr-p-2w'), 'white-container')}>
        <AddressSearch
          onSelectAddress={(address) => {
            if (address) {
              onLocationChange({
                x: address.geometry.coordinates[1],
                y: address.geometry.coordinates[0]
              });
              setMapLongitude(address.geometry.coordinates[0]);
              setMapLatitude(address.geometry.coordinates[1]);
              setMapZoom(12);
            }
          }}
        />
      </div>
      <SampleMap
        location={{
          x: mapLatitude,
          y: mapLongitude
        }}
        mapZoom={mapZoom}
        markerX={marker.x}
        markerY={marker.y}
        markerDraggable={true}
        onMarkerDragEnd={onMarkerDragEnd}
      />
    </>
  );
};

export default SampleGeolocation;

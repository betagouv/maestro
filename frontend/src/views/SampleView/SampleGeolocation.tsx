import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import maplibregl from 'maplibre-gl';
import React, { useMemo, useState } from 'react';
import Map, { Marker, MarkerDragEvent } from 'react-map-gl/maplibre';
import { UserLocation } from 'shared/schema/Sample/Sample';
interface Props {
  sampleId?: string;
  location?: UserLocation;
  onLocationChange: (coordinates: UserLocation) => void;
}

const SampleGeolocation = ({ sampleId, location, onLocationChange }: Props) => {
  const geolocationModal = useMemo(
    () =>
      createModal({
        id: `geolocation-modal-${sampleId}`,
        isOpenedByDefault: false,
      }),
    [sampleId]
  );

  const [marker, setMarker] = useState<UserLocation>();

  useIsModalOpen(geolocationModal, {
    onConceal: () => {
      setMarker(undefined);
    },
  });

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (marker) {
      onLocationChange(marker);
    }
    geolocationModal.close();
  };

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    setMarker({
      x: Number(event.lngLat.lat.toFixed(6)),
      y: Number(event.lngLat.lng.toFixed(6)),
    });
  };

  return (
    <>
      <Button
        iconId="fr-icon-map-pin-user-fill"
        priority="tertiary no outline"
        onClick={(event) => {
          event.preventDefault();
          geolocationModal.open();
          setMarker(
            location ?? {
              x: 46,
              y: 2.3522,
            }
          );
        }}
      >
        Localiser sur la carte
      </Button>
      <geolocationModal.Component
        title="Géolocalisation du prélevement"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: (e) => e.preventDefault(),
          },
          {
            children: 'Valider',
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        {marker && (
          <>
            <div className={cx('fr-pb-1w')}>
              Latitude: {marker.x}, Longitude: {marker.y}
            </div>
            <Map
              attributionControl
              id="sampleLocationMap"
              initialViewState={{
                latitude: marker.x,
                longitude: marker.y,
                zoom: location ? 15 : 5,
              }}
              style={{
                minHeight: 'calc(100vh / 2)',
                fontFamily: 'Marianne, sans-serif',
              }}
              mapLib={maplibregl}
              mapStyle="https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json"
              reuseMaps
            >
              <Marker
                longitude={marker.y}
                latitude={marker.x}
                anchor="bottom"
                draggable
                onDrag={onMarkerDragEnd}
              />
            </Map>
          </>
        )}
      </geolocationModal.Component>
    </>
  );
};

export default SampleGeolocation;

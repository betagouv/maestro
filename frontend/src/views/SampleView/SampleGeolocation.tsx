import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import maplibregl from 'maplibre-gl';
import React, { useMemo, useState } from 'react';
import Map, {
  FullscreenControl,
  Marker,
  MarkerDragEvent,
  NavigationControl,
} from 'react-map-gl/maplibre';
import { Geolocation } from 'shared/schema/Sample/Sample';
import config from 'src/utils/config';
interface Props {
  sampleId?: string;
  location?: Geolocation;
  onLocationChange: (coordinates: Geolocation) => void;
}

type ViewStyle = 'map' | 'satellite';

const ViewStyles: Record<ViewStyle, string | undefined> = {
  map: 'https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json',
  satellite: config.satelliteStyle,
};

const SampleGeolocation = ({ sampleId, location, onLocationChange }: Props) => {
  const geolocationModal = useMemo(
    () =>
      createModal({
        id: `geolocation-modal-${sampleId}`,
        isOpenedByDefault: false,
      }),
    [sampleId]
  );

  const [marker, setMarker] = useState<Geolocation>();
  const [viewStyle, setViewStyle] = useState<ViewStyle>('map');

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
              mapStyle={ViewStyles[viewStyle]}
            >
              <NavigationControl position="top-left" showCompass={false} />
              <FullscreenControl position="top-left" />
              <Marker
                longitude={marker.y}
                latitude={marker.x}
                anchor="bottom"
                draggable
                onDrag={onMarkerDragEnd}
              />
              {ViewStyles['satellite'] && (
                <Button
                  iconId={
                    viewStyle === 'map'
                      ? 'fr-icon-earth-fill'
                      : 'fr-icon-earth-line'
                  }
                  title={
                    viewStyle === 'map'
                      ? 'Afficher la vue satellite'
                      : 'Afficher la vue plan'
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setViewStyle(viewStyle === 'map' ? 'satellite' : 'map');
                  }}
                  priority="primary"
                  size="small"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 1,
                  }}
                />
              )}
            </Map>
          </>
        )}
      </geolocationModal.Component>
    </>
  );
};

export default SampleGeolocation;

import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Skeleton } from '@mui/material';
import type { Geolocation } from 'maestro-shared/schema/Geolocation/Geolocation';
import type React from 'react';
import { useState } from 'react';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import SampleGeolocation from 'src/components/Sample/SampleGeolocation/SampleGeolocation';
import type { UseForm } from 'src/hooks/useForm';

interface Props {
  title: string;
  geolocationX?: number;
  geolocationY?: number;
  onChangeLocation: (location: Geolocation) => void;
  onChangeGeolocationX: (x: number) => void;
  onChangeGeolocationY: (y: number) => void;
  inputForm: UseForm<any>;
  isOnline: boolean;
  readonly: boolean;
  children?: React.ReactNode;
}

const SampleGeolocationForm = ({
  title,
  geolocationX,
  geolocationY,
  onChangeLocation,
  onChangeGeolocationX,
  onChangeGeolocationY,
  inputForm,
  isOnline,
  readonly,
  children
}: Props) => {
  const [isGeolocateUnavailable, setIsGeolocateUnavailable] = useState(false);

  return (
    <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
      <div className={cx('fr-col-12', 'fr-pb-0')}>
        <div className={cx('fr-text--bold')}>{title}</div>
        <div className={cx('fr-text--light')}>
          Placez votre repère sur la zone correspondante ou renseignez
          manuellement les coordonnées GPS
        </div>
        {isGeolocateUnavailable && (
          <Alert
            severity="warning"
            title=""
            small
            closable
            onClose={() => setIsGeolocateUnavailable(false)}
            className={cx('fr-mt-2w')}
            description="Impossible de récupérer votre position. Placez le repère manuellement sur la carte ou saisissez les coordonnées."
          />
        )}
      </div>
      <div className={cx('fr-col-12', 'fr-col-sm-8')}>
        {isOnline && !readonly ? (
          <SampleGeolocation
            location={
              geolocationX && geolocationY
                ? { x: geolocationX, y: geolocationY }
                : undefined
            }
            onLocationChange={onChangeLocation}
            onGeolocateUnavailable={() => setIsGeolocateUnavailable(true)}
          />
        ) : (
          <Skeleton variant="rectangular" height={375} />
        )}
      </div>
      <div className={cx('fr-col-12', 'fr-col-sm-4')}>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextInput
              type="number"
              step={0.000001}
              value={geolocationX ?? ''}
              onChange={(e) => onChangeGeolocationX(Number(e.target.value))}
              inputForm={inputForm}
              inputKey="geolocationX"
              whenValid="Latitude correctement renseignée."
              data-testid="geolocationX-input"
              label="Latitude"
              required={isOnline}
              min={-90}
              max={90}
              disabled={readonly}
            />
          </div>
          <div className={cx('fr-col-12')}>
            <AppTextInput
              type="number"
              step={0.000001}
              value={geolocationY ?? ''}
              onChange={(e) => onChangeGeolocationY(Number(e.target.value))}
              inputForm={inputForm}
              inputKey="geolocationY"
              whenValid="Longitude correctement renseignée."
              data-testid="geolocationY-input"
              label="Longitude"
              required={isOnline}
              min={-180}
              max={180}
              disabled={readonly}
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SampleGeolocationForm;

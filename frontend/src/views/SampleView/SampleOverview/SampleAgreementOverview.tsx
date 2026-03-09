import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { formatDateTime } from 'maestro-shared/utils/date';
import './SampleOverview.scss';

interface Props {
  sample: SampleChecked;
}

const SampleAgreementOverview = ({ sample }: Props) => {
  return (
    <>
      <h3 className={cx('fr-m-0')}>Consentement par le détenteur</h3>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <RadioButtons
            legend="Le détenteur accepte les informations portées au présent procès-verbal"
            options={[
              {
                label: 'Oui',
                nativeInputProps: {
                  checked: sample.ownerAgreement,
                  disabled: true
                }
              },
              {
                label: 'Non',
                nativeInputProps: {
                  checked: !sample.ownerAgreement,
                  disabled: true
                }
              }
            ]}
            orientation="horizontal"
            classes={{
              root: cx('fr-px-0', 'fr-my-0')
            }}
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <Input
            textArea
            label="Déclaration du détenteur"
            hintText="Champ facultatif pour spécifier une éventuelle déclaration du détenteur"
            disabled
            nativeTextAreaProps={{
              value: sample.notesOnOwnerAgreement ?? '',
              rows: 1
            }}
          />
        </div>
      </div>
      <Alert
        severity={'info'}
        small={true}
        description={
          <>
            Le procès-verbal a été envoyé au détenteur{' '}
            <b>
              {sample.ownerLastName} {sample.ownerFirstName}
            </b>{' '}
            à l'email <b>{sample.ownerEmail}</b> le{' '}
            <b>{sample.sentAt ? formatDateTime(sample.sentAt) : ''}</b>.
          </>
        }
      ></Alert>
    </>
  );
};

export default SampleAgreementOverview;

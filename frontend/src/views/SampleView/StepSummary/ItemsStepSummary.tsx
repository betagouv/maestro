import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Input from '@codegouvfr/react-dsfr/Input';
import RadioButtons from '@codegouvfr/react-dsfr/RadioButtons';
import clsx from 'clsx';
import {
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'shared/schema/Sample/Sample';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { pluralize, quote } from 'src/utils/stringUtils';
import SampleItemDetails from 'src/views/SampleView/SampleItemDetails/SampleItemDetails';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  showLabel?: boolean;
}

const ItemsStepSummary = ({ sample, showLabel }: Props) => {
  const { laboratory } = usePartialSample(sample);

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          {pluralize(sample.items.length)('Échantillon prélevé')}
        </Badge>
      }
      showLabel={showLabel}
    >
      <div className="sample-items">
        {sample.items?.map((item, itemIndex) => (
          <div
            className={clsx(
              cx('fr-callout', 'fr-callout--pink-tuile'),
              'sample-callout'
            )}
            key={`item-${itemIndex}`}
          >
            <SampleItemDetails
              item={item}
              itemIndex={itemIndex}
              laboratory={laboratory}
            />
          </div>
        ))}
        {sample.notesOnItems && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-quote-line')}></div>
            <div>
              Note additionnelle{' '}
              <div>
                <b>{quote(sample.notesOnItems)}</b>
              </div>
            </div>
          </div>
        )}
      </div>
      <hr />
      <h3 className={cx('fr-m-0')}>Consentement par le détenteur</h3>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <RadioButtons
            legend="Le détenteur accepte les informations portées au présent procès verbal"
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
      <div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-mb-1w')}>
            <h6 className={cx('fr-mb-0')}>
              Envoi du procès verbal au détenteur de la marchandise
            </h6>
            {sample.items.length}{' '}
            {pluralize(sample.items.length)("document d'accompagnement")}
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-6', 'fr-col-sm-3')}>
            <Input
              label="Identité du détenteur"
              hintText="Nom"
              disabled
              nativeInputProps={{
                value: sample.ownerLastName ?? ''
              }}
            />
          </div>
          <div className={cx('fr-col-6', 'fr-col-sm-3')}>
            <Input
              label={' '}
              hintText="Prénom"
              disabled
              nativeInputProps={{
                disabled: true,
                value: sample.ownerFirstName ?? ''
              }}
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <Input
              label="E-mail du détenteur"
              hintText="Le détenteur a reçu une copie du procès verbal"
              disabled
              nativeInputProps={{
                disabled: true,
                value: sample.ownerEmail ?? ''
              }}
            />
          </div>
        </div>
      </div>
    </StepSummary>
  );
};

export default ItemsStepSummary;

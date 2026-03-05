import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { format } from 'date-fns';
import './SampleItemAdmissibility.scss';

import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { SampleItemRecipientKindLabels } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { SampleItemAdmissibilityEditModal } from './SampleItemAdmissibilityEditModal';
interface Props {
  sample: SampleChecked;
  sampleItem: SampleItem;
  sampleItemAnalysis?: PartialAnalysis;
  readonly: boolean;
}

const editSampleAdmissibility = createModal({
  id: `edit-sample-admissibility-modale-id`,
  isOpenedByDefault: false
});

export const SampleItemAdmissibility: FunctionComponent<Props> = ({
  sample,
  sampleItem,
  sampleItemAnalysis,
  readonly,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { getSampleItemLaboratory } = usePartialSample(sample);

  let message: string = '';

  if (sampleItem.receiptDate) {
    message = `${sampleItemAnalysis?.status !== 'NotAdmissible' ? 'Échantillon recevable' : 'Échantillon non recevable'} reçu par le laboratoire le ${format(sampleItem.receiptDate, 'dd/MM/yyyy')}`;
  } else {
    message = 'Aucune information relative à la réception par le laboratoire.';
  }

  return (
    <div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6')}>
          <div className={cx('fr-mb-1v')}>Destinataire</div>
          <div className={cx('fr-text--bold')}>
            {sampleItem.copyNumber === 1 ? (
              <>
                {sampleItem?.laboratoryId
                  ? getLaboratoryFullName(
                      getSampleItemLaboratory(sampleItem.itemNumber)
                    )
                  : 'Information non disponible'}
              </>
            ) : (
              SampleItemRecipientKindLabels[sampleItem.recipientKind]
            )}
          </div>
        </div>
        <div className={cx('fr-col-6')}>
          <div className={clsx('d-flex-align-center')}>
            <span className="flex-grow-1">Réception</span>
            {!readonly && (
              <Button
                priority={'tertiary no outline'}
                iconId={'fr-icon-edit-line'}
                size={'small'}
                type={'button'}
                onClick={() => {
                  editSampleAdmissibility.open();
                }}
              >
                Éditer
              </Button>
            )}
          </div>
          <div className={cx('fr-text--bold')}>{message}</div>

          {!!sampleItem.notesOnAdmissibility &&
            sampleItem.notesOnAdmissibility.length > 0 && (
              <i>{sampleItem.notesOnAdmissibility}</i>
            )}
        </div>

        <SampleItemAdmissibilityEditModal
          modal={editSampleAdmissibility}
          sampleItem={sampleItem}
          sampleItemAnalysis={sampleItemAnalysis}
        />
      </div>
    </div>
  );
};

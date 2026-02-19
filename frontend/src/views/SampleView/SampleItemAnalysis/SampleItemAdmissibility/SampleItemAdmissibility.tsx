import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { formatDate } from 'maestro-shared/utils/date';
import './SampleItemAdmissibility.scss';

import { getLaboratoryFullName } from 'maestro-shared/schema/Laboratory/Laboratory';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { usePartialSample } from '../../../../hooks/usePartialSample';
import { SampleItemAdmissibilityEditModal } from './SampleItemAdmissibilityEditModal';
interface Props {
  sample: SampleChecked;
  sampleItem: SampleItem;
  readonly: boolean;
}

const editSampleAdmissibility = createModal({
  id: `edit-sample-admissibility-modale-id`,
  isOpenedByDefault: false
});

export const SampleItemAdmissibility: FunctionComponent<Props> = ({
  sample,
  sampleItem,
  readonly,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const { getSampleItemLaboratory } = usePartialSample(sample);

  let message: string = '';

  if (sample.receivedAt) {
    message = `${sample.status !== 'NotAdmissible' ? 'Échantillon recevable' : 'Échantillon non recevable'} reçu par le laboratoire le ${formatDate(sample.receivedAt)}`;
  } else {
    message = 'Aucune information relative à la réception par le laboratoire.';
  }

  return (
    <div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-6')}>
          <div className={cx('fr-mb-1v')}>Destinataire</div>
          <div className={cx('fr-text--bold')}>
            {sampleItem?.laboratoryId
              ? getLaboratoryFullName(
                  getSampleItemLaboratory(sampleItem.itemNumber)
                )
              : 'Information non disponible'}
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
        </div>

        <SampleItemAdmissibilityEditModal
          modal={editSampleAdmissibility}
          sample={sample}
        />
      </div>

      {!!sample.notesOnAdmissibility &&
        sample.notesOnAdmissibility.length > 0 && (
          <i>{sample.notesOnAdmissibility}</i>
        )}
    </div>
  );
};

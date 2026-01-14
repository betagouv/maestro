import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { SampleChecked } from 'maestro-shared/schema/Sample/Sample';
import { formatDate } from 'maestro-shared/utils/date';
import './SampleAdmissibility.scss';

import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { SampleAdmissibilityEditModal } from './SampleAdmissibilityEditModal';
interface Props {
  sample: SampleChecked;
  readonly: boolean;
}

const editSampleAdmissibility = createModal({
  id: `edit-sample-admissibility-modale-id`,
  isOpenedByDefault: false
});

export const SampleAdmissibility: FunctionComponent<Props> = ({
  sample,
  readonly,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  let message: string = '';

  if (sample.receivedAt) {
    message = `${sample.status !== 'NotAdmissible' ? 'Échantillon recevable' : 'Échantillon non recevable'} reçu par le laboratoire le ${formatDate(sample.receivedAt)}`;
  } else {
    message = 'Aucune information relative à la réception par le laboratoire.';
  }

  return (
    <div>
      <div className={clsx('d-flex-align-center')}>
        <span className={cx('fr-text--lg', 'fr-text--regular', 'fr-mb-0')}>
          {message}
        </span>
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

        <SampleAdmissibilityEditModal
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

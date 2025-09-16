import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { SubstanceKindLaboratory } from 'maestro-shared/schema/LocalPrescription/LocalPrescriptionSubstanceKindLaboratory';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useRef } from 'react';
import { pluralize } from 'src/utils/stringUtils';
import LocalPrescriptionSubstanceKindsLaboratories from '../../../components/LocalPrescription/LocalPrescriptionSubstanceKindsLaboratories/LocalPrescriptionSubstanceKindsLaboratories';
import './ProgrammingPrescriptionList.scss';
interface Props {
  programmingPlan: ProgrammingPlan;
  selectedCount: number;
  totalCount: number;
  onSubmit: (
    substanceKindsLaboratories: SubstanceKindLaboratory[]
  ) => Promise<void>;
  onCancel: () => void;
  onSelectAll: () => void;
}

const ProgrammingPrescriptionListGroupedUpdate = ({
  programmingPlan,
  selectedCount,
  totalCount,
  onSubmit,
  onCancel,
  onSelectAll
}: Props) => {
  const laboratoriesUpdateContentRef = useRef<
    (HTMLDivElement & { submit: () => Promise<boolean> }) | null
  >(null);

  return (
    <div className={clsx(cx('fr-mt-5w'), 'grouped-update-container')}>
      <div className={clsx(cx('fr-py-4w', 'fr-px-3w'), 'grouped-update-card')}>
        <div>
          <h6 className={cx('fr-mb-1w')}>
            Action groupée
            <span className={cx('fr-text--regular', 'fr-mb-0', 'fr-mx-1w')}>
              •{' '}
              {pluralize(selectedCount, {
                preserveCount: true
              })('sélectionnée')}
            </span>
          </h6>
          <Button
            onClick={onSelectAll}
            priority="tertiary no outline"
            className={clsx(cx('fr-link--sm'), 'link-underline')}
          >
            Tout{' '}
            {totalCount === selectedCount ? 'désélectionner' : 'sélectionner'}
          </Button>
        </div>
        <div>
          <LocalPrescriptionSubstanceKindsLaboratories
            ref={laboratoriesUpdateContentRef}
            substanceKindsLaboratories={programmingPlan.substanceKinds.map(
              (substanceKind) => ({
                substanceKind,
                laboratoryId: undefined
              })
            )}
            onSubmit={onSubmit}
          />
          <div className={clsx(cx('fr-mt-3w'), 'float-right')}>
            <Button
              className={cx('fr-mr-2w')}
              onClick={() => laboratoriesUpdateContentRef.current?.submit()}
            >
              Mettre à jour
            </Button>
            <Button priority="secondary" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammingPrescriptionListGroupedUpdate;

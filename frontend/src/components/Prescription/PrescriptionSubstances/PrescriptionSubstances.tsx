import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { SSD2IdSort } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { findPrescriptionSubPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  AdditionalSubstanceKindList,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import { pluralize } from 'src/utils/stringUtils';

interface Props {
  programmingPlan: ProgrammingPlanChecked;
  prescription: Prescription;
}

const PrescriptionSubstances = ({ programmingPlan, prescription }: Props) => {
  const subPlan = findPrescriptionSubPlan([programmingPlan], prescription);
  const monoSubstances = subPlan?.monoSubstances ?? [];
  const multiSubstances = subPlan?.multiSubstances ?? [];

  return (
    <div>
      <div className="d-flex-align-center">
        <span className={cx('fr-icon-test-tube-line', 'fr-pr-1v')} />
        <b>Analyses</b>
      </div>
      <div>
        <div className={cx('fr-py-1v')}>
          <span
            className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
          />
          {t('analysis', {
            count: monoSubstances.length
          })}{' '}
          mono résidu
          <div className={cx('fr-ml-2w')}>
            {[...monoSubstances].sort(SSD2IdSort).map((substance) => (
              <Tag key={`Mono-${substance}`} small className={cx('fr-m-1v')}>
                {SSD2IdLabel[substance]}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className={cx('fr-py-1v')}>
          <span
            className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
          />
          {`Analyse multi-résidu (${
            multiSubstances.length
          } ${pluralize(multiSubstances.length)('spécifiée')})`}
          <div className={cx('fr-ml-2w')}>
            {[...multiSubstances].sort(SSD2IdSort).map((substance) => (
              <Tag key={`Multi-${substance}`} small className={cx('fr-m-1v')}>
                {SSD2IdLabel[substance]}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      {subPlan?.substanceKinds
        ?.filter((substance) => AdditionalSubstanceKindList.includes(substance))
        .map((substance, index) => (
          <div
            key={`substanceKind-${index}`}
            className={clsx(cx('fr-py-1v'), 'flex-align-center')}
          >
            <span
              className={cx('fr-icon-check-line', 'fr-icon--sm', 'fr-mr-1w')}
            />
            {SubstanceKindLabels[substance]}
          </div>
        ))}
    </div>
  );
};

export default PrescriptionSubstances;

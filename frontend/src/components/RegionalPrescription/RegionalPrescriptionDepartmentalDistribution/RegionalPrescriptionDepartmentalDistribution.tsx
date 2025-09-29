import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { RegionalPrescription } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { useMemo } from 'react';
import { pluralize } from '../../../utils/stringUtils';
import RegionalPrescriptionDistributionTable from '../RegionalPrescriptionDistributionTable/RegionalPrescriptionDistributionTable';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: RegionalPrescription;
  departmentalPrescriptions: RegionalPrescription[];
  onChangeDepartmentalCount: (
    department: Department,
    value: number
  ) => Promise<void>;
}

const RegionalPrescriptionDepartmentalDistribution = ({
  programmingPlan,
  prescription,
  regionalPrescription,
  departmentalPrescriptions,
  onChangeDepartmentalCount
}: Props) => {
  const distributedSampleCount = useMemo(
    () => sumBy(departmentalPrescriptions, 'sampleCount'),
    [departmentalPrescriptions]
  );

  return (
    <>
      <div className={cx('fr-text--bold', 'fr-mb-3w', 'fr-pt-1w')}>
        {t('sample', {
          count: regionalPrescription.sampleCount
        })}
        {' • '}
        <Badge noIcon severity="success" className={'fr-px-1w'}>
          {distributedSampleCount}{' '}
          {pluralize(distributedSampleCount)('attribué')}
        </Badge>
        <Badge noIcon severity="error" className={'fr-mx-1w'}>
          {regionalPrescription.sampleCount - distributedSampleCount} à assigner
        </Badge>
      </div>
      <div>
        Départements
        <RegionalPrescriptionDistributionTable
          programmingPlan={programmingPlan}
          prescription={prescription}
          regionalPrescription={regionalPrescription}
          departmentalPrescriptions={departmentalPrescriptions}
          onChangeDepartmentalCount={onChangeDepartmentalCount}
          displayedPart="first"
        />
        <RegionalPrescriptionDistributionTable
          programmingPlan={programmingPlan}
          prescription={prescription}
          regionalPrescription={regionalPrescription}
          departmentalPrescriptions={departmentalPrescriptions}
          onChangeDepartmentalCount={onChangeDepartmentalCount}
          displayedPart="second"
        />
      </div>
    </>
  );
};

export default RegionalPrescriptionDepartmentalDistribution;

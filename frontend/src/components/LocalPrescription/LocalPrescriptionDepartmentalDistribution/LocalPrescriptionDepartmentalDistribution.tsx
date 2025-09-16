import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { sumBy } from 'lodash-es';
import { Department } from 'maestro-shared/referential/Department';
import { LocalPrescription } from 'maestro-shared/schema/LocalPrescription/LocalPrescription';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { pluralize } from '../../../utils/stringUtils';
import LocalPrescriptionDepartmentalDistributionTable from './LocalPrescriptionDepartmentalDistributionTable';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  regionalPrescription: LocalPrescription;
  departmentalPrescriptions: LocalPrescription[];
  onSubmit: (slaughterhousePrescriptions: LocalPrescription[]) => Promise<void>;
}
const LocalPrescriptionDepartmentalDistribution = forwardRef<
  { submit: () => void },
  Props
>((props, ref) => {
  const { programmingPlan, prescription, regionalPrescription, onSubmit } =
    props;

  const [departmentalPrescriptions, setDepartmentalPrescriptions] = useState(
    props.departmentalPrescriptions
  );

  const distributedSampleCount = useMemo(
    () => sumBy(departmentalPrescriptions, 'sampleCount'),
    [departmentalPrescriptions]
  );

  const changeDepartmentalCount = async (
    department: Department,
    sampleCount: number
  ) => {
    setDepartmentalPrescriptions((prev) =>
      prev?.map((dp) =>
        dp.department === department ? { ...dp, sampleCount } : dp
      )
    );
  };

  useImperativeHandle(ref, () => ({
    submit: async () => onSubmit(departmentalPrescriptions)
  }));

  return (
    <>
      <div className={cx('fr-text--bold', 'fr-mb-3w', 'fr-pt-1w')}>
        {t('sample', {
          count: regionalPrescription.sampleCount
        })}
        {' • '}
        <Badge noIcon severity="success" className={'fr-px-1w'}>
          {pluralize(distributedSampleCount, {
            preserveCount: true
          })('attribué')}
        </Badge>
        <Badge noIcon severity="error" className={'fr-mx-1w'}>
          {regionalPrescription.sampleCount - distributedSampleCount} à assigner
        </Badge>
      </div>
      <div className={cx('fr-mb-2w')}>Départements</div>
      <div>
        <LocalPrescriptionDepartmentalDistributionTable
          programmingPlan={programmingPlan}
          prescription={prescription}
          regionalPrescription={regionalPrescription}
          departmentalPrescriptions={departmentalPrescriptions}
          onChangeDepartmentalCount={changeDepartmentalCount}
          displayedPart="first"
        />
        <LocalPrescriptionDepartmentalDistributionTable
          programmingPlan={programmingPlan}
          prescription={prescription}
          regionalPrescription={regionalPrescription}
          departmentalPrescriptions={departmentalPrescriptions}
          onChangeDepartmentalCount={changeDepartmentalCount}
          displayedPart="second"
        />
      </div>
    </>
  );
});

export default LocalPrescriptionDepartmentalDistribution;

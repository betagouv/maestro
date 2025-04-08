import { t } from 'i18next';
import { Region } from 'maestro-shared/referential/Region';
import { PrescriptionOptionsInclude } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import { Context } from 'maestro-shared/schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import { useFindRegionalPrescriptionsQuery } from '../../../services/regionalPrescription.service';

interface Props {
  programmingPlan: ProgrammingPlan;
  context: Context;
  region?: Region;
}

const ProgrammingPlanCommentList = ({
  programmingPlan,
  region,
  context,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const findPrescriptionOptions = useMemo(
    () => ({
      programmingPlanId: programmingPlan?.id as string,
      context,
      region,
      includes: ['substanceCount' as PrescriptionOptionsInclude]
    }),
    [programmingPlan, context, region]
  );

  const { data: regionalPrescriptions } = useFindRegionalPrescriptionsQuery({
    ...findPrescriptionOptions,
    includes: ['comments']
  });

  const commentedPrescriptions = useMemo(
    () =>
      (regionalPrescriptions ?? []).filter(
        (prescription) => (prescription.comments ?? []).length > 0
      ),
    [regionalPrescriptions]
  );

  return (
    <>
      {t('matrix', {
        count: commentedPrescriptions.length
      })}{' '}
       
      {t('has_been_commented', {
        count: commentedPrescriptions.length
      })}
    </>
  );
};

export default ProgrammingPlanCommentList;

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { skipToken } from '@reduxjs/toolkit/query';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useContext } from 'react';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import SubstanceSearch from '../../SubstanceSearch/SubstanceSearch';
import '../PrescriptionModal/PrescriptionModal.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescription: Prescription;
  onUpdatePrescriptionSubstances: (
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionEditSubstances = ({
  programmingPlan,
  prescription,
  onUpdatePrescriptionSubstances
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { hasUserPrescriptionPermission } = useAuthentication();

  const { data: prescriptionSubstances } =
    apiClient.useGetPrescriptionSubstancesQuery(prescription.id ?? skipToken);

  const getSubstancesByAnalysisMethod = useCallback(
    (analysisMethod: AnalysisMethod) =>
      (prescriptionSubstances ?? []).filter(
        (substance) => substance.analysisMethod === analysisMethod
      ),
    [prescriptionSubstances]
  );

  return (
    <>
      <SubstanceSearch
        analysisMethod="Mono"
        substances={getSubstancesByAnalysisMethod('Mono').map(
          (_) => _.substance
        )}
        onChangeSubstances={(substances) =>
          onUpdatePrescriptionSubstances([
            ...getSubstancesByAnalysisMethod('Multi'),
            ...substances.map((substance) => ({
              prescriptionId: prescription.id,
              substance,
              analysisMethod: 'Mono' as const
            }))
          ])
        }
        readonly={!hasUserPrescriptionPermission(programmingPlan)?.update}
      />
      <hr className={cx('fr-mt-3w', 'fr-mb-2w')} />
      <SubstanceSearch
        analysisMethod="Multi"
        substances={getSubstancesByAnalysisMethod('Multi').map(
          (_) => _.substance
        )}
        onChangeSubstances={(substances) =>
          onUpdatePrescriptionSubstances([
            ...getSubstancesByAnalysisMethod('Mono'),
            ...substances.map((substance) => ({
              prescriptionId: prescription.id,
              substance,
              analysisMethod: 'Multi' as const
            }))
          ])
        }
        readonly={!hasUserPrescriptionPermission(programmingPlan)?.update}
      />
    </>
  );
};

export default PrescriptionEditSubstances;

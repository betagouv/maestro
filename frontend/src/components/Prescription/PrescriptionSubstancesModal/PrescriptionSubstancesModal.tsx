import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { skipToken } from '@reduxjs/toolkit/query';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { ProgrammingPlan } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { useAuthentication } from '../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../services/apiClient';
import SubstanceSearch from '../../SubstanceSearch/SubstanceSearch';
import './PrescriptionSubstances.scss';

const prescriptionSubstancesModal = createModal({
  id: `prescription-substances-modal`,
  isOpenedByDefault: false
});

interface Props {
  programmingPlans: ProgrammingPlan[];
  onUpdatePrescriptionSubstances: (
    prescription: Prescription,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionSubstancesModal = ({
  programmingPlans,
  onUpdatePrescriptionSubstances
}: Props) => {
  const apiClient = useContext(ApiClientContext);
  const dispatch = useAppDispatch();
  const { hasUserPrescriptionPermission } = useAuthentication();
  const { prescriptionAnalysisEdit: prescriptionAnalysisEdit } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: prescriptionSubstances } =
    apiClient.useGetPrescriptionSubstancesQuery(
      prescriptionAnalysisEdit?.id ?? skipToken
    );

  const getSubstancesByAnalysisMethod = useCallback(
    (analysisMethod: AnalysisMethod) =>
      (prescriptionSubstances ?? []).filter(
        (substance) => substance.analysisMethod === analysisMethod
      ),
    [prescriptionSubstances]
  );

  const programmingPlan = useMemo(
    () =>
      programmingPlans.find(
        (plan) => plan.id === prescriptionAnalysisEdit?.programmingPlanId
      ),
    [programmingPlans, prescriptionAnalysisEdit]
  );

  useIsModalOpen(prescriptionSubstancesModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setPrescriptionAnalysisEdit(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionAnalysisEdit) {
      prescriptionSubstancesModal.open();
    }
  }, [prescriptionAnalysisEdit]);

  return (
    <div className="prescription-substances-modal">
      <prescriptionSubstancesModal.Component
        title="Analyses mono-résidu et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        {programmingPlan &&
          prescriptionAnalysisEdit &&
          prescriptionSubstances && (
            <>
              <SubstanceSearch
                analysisMethod="Mono"
                substances={getSubstancesByAnalysisMethod('Mono').map(
                  (_) => _.substance
                )}
                onChangeSubstances={(substances) =>
                  onUpdatePrescriptionSubstances(prescriptionAnalysisEdit, [
                    ...getSubstancesByAnalysisMethod('Multi'),
                    ...substances.map((substance) => ({
                      prescriptionId: prescriptionAnalysisEdit.id,
                      substance,
                      analysisMethod: 'Mono' as const
                    }))
                  ])
                }
                readonly={
                  !hasUserPrescriptionPermission(programmingPlan)?.update
                }
              />
              <hr className={cx('fr-mt-3w', 'fr-mb-2w')} />
              <SubstanceSearch
                analysisMethod="Multi"
                substances={getSubstancesByAnalysisMethod('Multi').map(
                  (_) => _.substance
                )}
                onChangeSubstances={(substances) =>
                  onUpdatePrescriptionSubstances(prescriptionAnalysisEdit, [
                    ...getSubstancesByAnalysisMethod('Mono'),
                    ...substances.map((substance) => ({
                      prescriptionId: prescriptionAnalysisEdit.id,
                      substance,
                      analysisMethod: 'Multi' as const
                    }))
                  ])
                }
                readonly={
                  !hasUserPrescriptionPermission(programmingPlan)?.update
                }
              />
            </>
          )}
      </prescriptionSubstancesModal.Component>
    </div>
  );
};

export default PrescriptionSubstancesModal;

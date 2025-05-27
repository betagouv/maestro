import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { skipToken } from '@reduxjs/toolkit/query';
import { AnalysisMethod } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { PrescriptionSubstance } from 'maestro-shared/schema/Prescription/PrescriptionSubstance';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/useStore';
import { useGetPrescriptionSubstancesQuery } from 'src/services/prescription.service';
import prescriptionsSlice from 'src/store/reducers/prescriptionsSlice';
import { useAuthentication } from '../../../hooks/useAuthentication';
import SubstanceSearch from '../../SubstanceSearch/SubstanceSearch';
import './PrescriptionSubstances.scss';

const prescriptionSubstancesModal = createModal({
  id: `prescription-substances-modal`,
  isOpenedByDefault: false
});

interface Props {
  onUpdatePrescriptionSubstances: (
    prescriptionId: string,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionSubstancesModal = ({
  onUpdatePrescriptionSubstances
}: Props) => {
  const dispatch = useAppDispatch();
  const { hasUserPrescriptionPermission } = useAuthentication();
  const { programmingPlan } = useAppSelector((state) => state.programmingPlan);
  const { prescriptionAnalysisEditId } = useAppSelector(
    (state) => state.prescriptions
  );

  const { data: prescriptionSubstances } = useGetPrescriptionSubstancesQuery(
    prescriptionAnalysisEditId ?? skipToken
  );

  const getSubstancesByAnalysisMethod = useCallback(
    (analysisMethod: AnalysisMethod) =>
      (prescriptionSubstances ?? []).filter(
        (substance) => substance.analysisMethod === analysisMethod
      ),
    [prescriptionSubstances]
  );

  useIsModalOpen(prescriptionSubstancesModal, {
    onConceal: () => {
      dispatch(
        prescriptionsSlice.actions.setPrescriptionAnalysisEditId(undefined)
      );
    }
  });

  useEffect(() => {
    if (prescriptionAnalysisEditId) {
      prescriptionSubstancesModal.open();
    }
  }, [prescriptionAnalysisEditId]);

  return (
    <div className="prescription-substances-modal">
      <prescriptionSubstancesModal.Component
        title="Analyses mono-résidu et multi-résidus"
        concealingBackdrop={false}
        topAnchor
      >
        {programmingPlan &&
          prescriptionAnalysisEditId &&
          prescriptionSubstances && (
            <>
              <SubstanceSearch
                analysisMethod="Mono"
                substances={getSubstancesByAnalysisMethod('Mono').map(
                  (_) => _.substance
                )}
                onChangeSubstances={(substances) =>
                  onUpdatePrescriptionSubstances(prescriptionAnalysisEditId, [
                    ...getSubstancesByAnalysisMethod('Multi'),
                    ...substances.map((substance) => ({
                      prescriptionId: prescriptionAnalysisEditId,
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
                  onUpdatePrescriptionSubstances(prescriptionAnalysisEditId, [
                    ...getSubstancesByAnalysisMethod('Mono'),
                    ...substances.map((substance) => ({
                      prescriptionId: prescriptionAnalysisEditId,
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

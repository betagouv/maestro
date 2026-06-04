import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { useContext, useEffect, useState } from 'react';
import { ApiClientContext } from '../../../services/apiClient';
import { AddFieldToProgrammingSubPlanModal } from './AddFieldToProgrammingSubPlanModal';
import { ProgrammingSubPlanFieldList } from './ProgrammingSubPlanFieldList';

const addFieldModal = createModal({
  id: 'plan-kind-add-field-modal',
  isOpenedByDefault: false
});

export const ProgrammingSubPlanSpecificDataView = () => {
  const apiClient = useContext(ApiClientContext);

  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({});
  const sortedPlans = [...programmingPlans].sort((a, b) => b.year - a.year);

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedSubPlanId, setSelectedSubPlanId] = useState<string>('');

  const selectedPlan = sortedPlans.find((p) => p.id === selectedPlanId);

  useEffect(() => {
    if (
      sortedPlans.length > 0 &&
      !sortedPlans.some((p) => p.id === selectedPlanId)
    ) {
      setSelectedPlanId(sortedPlans[0].id);
      setSelectedSubPlanId('');
    }
  }, [sortedPlans, selectedPlanId]);

  useEffect(() => {
    if (
      selectedPlan?.subPlans.length &&
      !selectedPlan.subPlans.some((sp) => sp.id === selectedSubPlanId)
    ) {
      setSelectedSubPlanId(selectedPlan.subPlans[0]?.id ?? '');
    }
  }, [selectedPlan, selectedSubPlanId]);

  const { data: programmingSubPlanFields = [], isLoading: isLoadingFields } =
    apiClient.useFindProgrammingSubPlanFieldConfigsQuery(
      {
        programmingPlanId: selectedPlanId,
        programmingSubPlanId: selectedSubPlanId as ProgrammingSubPlanId
      },
      { skip: !selectedPlanId || !selectedSubPlanId }
    );

  const { data: allFields = [] } = apiClient.useFindAllFieldConfigsQuery();

  return (
    <div className={cx('fr-p-2w')}>
      <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>
        <Select
          label="Plan de programmation"
          nativeSelectProps={{
            value: selectedPlanId,
            onChange: (e) => {
              setSelectedPlanId(e.target.value);
              setSelectedSubPlanId('');
            }
          }}
          className="fr-col-6"
        >
          {sortedPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title} ({plan.year})
            </option>
          ))}
        </Select>

        {selectedPlan && selectedPlan.subPlans.length > 0 && (
          <Select
            label="Sous-plan"
            nativeSelectProps={{
              value: selectedSubPlanId,
              onChange: (e) => setSelectedSubPlanId(e.target.value)
            }}
            className="fr-col-6"
          >
            {selectedPlan.subPlans.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {selectedPlanId && selectedSubPlanId && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            className={cx('fr-mb-2w')}
          >
            <h2 className={cx('fr-mb-0')}>Champs actifs</h2>
            <Button
              iconId="fr-icon-add-line"
              onClick={() => addFieldModal.open()}
              disabled={
                allFields.filter(
                  (f) =>
                    !programmingSubPlanFields.some(
                      (pkf) => pkf.field.key === f.key
                    )
                ).length === 0
              }
            >
              Ajouter un champ
            </Button>
          </div>

          {isLoadingFields ? (
            <p>Chargement…</p>
          ) : (
            <ProgrammingSubPlanFieldList
              programmingPlanId={selectedPlanId}
              programmingSubPlanId={selectedSubPlanId as ProgrammingSubPlanId}
              programmingSubPlanFields={programmingSubPlanFields}
              allFields={allFields}
            />
          )}

          <AddFieldToProgrammingSubPlanModal
            modal={addFieldModal}
            programmingPlanId={selectedPlanId}
            programmingSubPlanId={selectedSubPlanId as ProgrammingSubPlanId}
            allFields={allFields}
            activeFields={programmingSubPlanFields}
          />
        </>
      )}
    </div>
  );
};

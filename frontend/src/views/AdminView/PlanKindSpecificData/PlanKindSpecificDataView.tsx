import Button from '@codegouvfr/react-dsfr/Button';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Select from '@codegouvfr/react-dsfr/Select';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  ProgrammingPlanKind,
  ProgrammingPlanKindLabels,
  ProgrammingPlanKindListSorted
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { useContext, useEffect, useState } from 'react';
import { ApiClientContext } from '../../../services/apiClient';
import { AddFieldToKindModal } from './AddFieldToKindModal';
import { PlanKindFieldList } from './PlanKindFieldList';

const addFieldModal = createModal({
  id: 'plan-kind-add-field-modal',
  isOpenedByDefault: false
});

interface Props {
  defaultKind?: ProgrammingPlanKind;
}

export const PlanKindSpecificDataView = ({ defaultKind }: Props = {}) => {
  const apiClient = useContext(ApiClientContext);

  const [kind, setKind] = useState<ProgrammingPlanKind>(
    defaultKind ?? ProgrammingPlanKindListSorted[0]
  );

  const { data: programmingPlans = [] } =
    apiClient.useFindProgrammingPlansQuery({
      kinds: [kind]
    });
  const sortedPlans = [...programmingPlans].sort((a, b) => b.year - a.year);

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    setSelectedPlanId('');
  }, [kind]);

  useEffect(() => {
    if (
      sortedPlans.length > 0 &&
      !sortedPlans.some((p) => p.id === selectedPlanId)
    ) {
      setSelectedPlanId(sortedPlans[0].id);
    }
  }, [sortedPlans, selectedPlanId]);

  const { data: planKindFields = [], isLoading: isLoadingFields } =
    apiClient.useFindPlanKindFieldConfigsQuery(
      { programmingPlanId: selectedPlanId, kind },
      { skip: !selectedPlanId }
    );

  const { data: allFields = [] } = apiClient.useFindAllFieldConfigsQuery();

  return (
    <div className={cx('fr-p-2w')}>
      <div className={clsx(cx('fr-grid-row', 'fr-grid-row--gutters'))}>
        <Select
          label="Type de plan"
          nativeSelectProps={{
            value: kind,
            onChange: (e) => setKind(e.target.value as ProgrammingPlanKind)
          }}
          className="fr-col-6"
        >
          {ProgrammingPlanKindListSorted.map((k) => (
            <option key={k} value={k}>
              {ProgrammingPlanKindLabels[k]}
            </option>
          ))}
        </Select>

        {sortedPlans.length > 0 && (
          <Select
            label="Plan de programmation"
            nativeSelectProps={{
              value: selectedPlanId,
              onChange: (e) => setSelectedPlanId(e.target.value)
            }}
            className="fr-col-6"
          >
            {sortedPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title} ({plan.year})
              </option>
            ))}
          </Select>
        )}
      </div>

      {selectedPlanId && (
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
                  (f) => !planKindFields.some((pkf) => pkf.field.key === f.key)
                ).length === 0
              }
            >
              Ajouter un champ
            </Button>
          </div>

          {isLoadingFields ? (
            <p>Chargement…</p>
          ) : (
            <PlanKindFieldList
              programmingPlanId={selectedPlanId}
              kind={kind}
              planKindFields={planKindFields}
              allFields={allFields}
            />
          )}

          <AddFieldToKindModal
            modal={addFieldModal}
            programmingPlanId={selectedPlanId}
            kind={kind}
            allFields={allFields}
            activeFields={planKindFields}
          />
        </>
      )}
    </div>
  );
};

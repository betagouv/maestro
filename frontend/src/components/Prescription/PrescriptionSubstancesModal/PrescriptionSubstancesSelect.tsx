import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import { Autocomplete } from '@mui/material';
import { capitalize } from 'lodash';
import { SyntheticEvent, useMemo, useState } from 'react';
import {
  AnalysisKind,
  AnalysisKindLabels
} from 'shared/schema/Analysis/AnalysisKind';
import { PrescriptionSubstance } from 'shared/schema/Prescription/PrescriptionSubstance';
import { ProgrammingPlan } from 'shared/schema/ProgrammingPlan/ProgrammingPlans';
import { Substance } from 'shared/schema/Substance/Substance';
import { useAuthentication } from 'src/hooks/useAuthentication';
import { useLazySearchSubstancesQuery } from 'src/services/substance.service';
import './PrescriptionSubstances.scss';

interface Props {
  programmingPlan: ProgrammingPlan;
  prescriptionId: string;
  prescriptionSubstances: PrescriptionSubstance[];
  analysisKind: AnalysisKind;
  onUpdatePrescriptionSubstances: (
    prescriptionId: string,
    prescriptionSubstances: PrescriptionSubstance[]
  ) => Promise<void>;
}

const PrescriptionSubstancesSelect = ({
  programmingPlan,
  prescriptionId,
  prescriptionSubstances,
  analysisKind,
  onUpdatePrescriptionSubstances
}: Props) => {
  const { hasUserPrescriptionPermission } = useAuthentication();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [substanceSearchResults, setSubstanceSearchResults] = useState<
    Substance[]
  >([]);
  const [searchSubstances, { isLoading, isFetching }] =
    useLazySearchSubstancesQuery();
  const [newSubstance, setNewSubstance] = useState<Substance | null>(null);

  const filteredPrescriptionSubstances = useMemo(() => {
    return prescriptionSubstances.filter(
      (prescriptionSubstance) =>
        prescriptionSubstance.analysisKind === analysisKind
    );
  }, [prescriptionSubstances, analysisKind]);

  const handleInputChange = async (
    _event: SyntheticEvent<Element, Event>,
    value: string
  ) => {
    setSearchQuery(value);

    if (value.length > 3) {
      await searchSubstances(value as string)
        .unwrap()
        .then((results) => {
          setSubstanceSearchResults(
            results.filter(
              ({ code }) =>
                !filteredPrescriptionSubstances.some(
                  (_) => _.substance.code === code
                )
            )
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  const addSubstance = async (substance: Substance) => {
    await onUpdatePrescriptionSubstances(prescriptionId, [
      ...prescriptionSubstances,
      {
        prescriptionId,
        substance,
        analysisKind
      }
    ]);
    setNewSubstance(null);
  };

  const removeSubstance = async (substance: Substance) => {
    await onUpdatePrescriptionSubstances(
      prescriptionId,
      prescriptionSubstances.filter((_) => _.substance.code !== substance.code)
    );
  };

  return (
    <div>
      <label className={cx('fr-label', 'fr-mb-1w')}>
        {capitalize(AnalysisKindLabels[analysisKind])}
      </label>
      {hasUserPrescriptionPermission(programmingPlan)?.update && (
        <div className="d-flex-align-center">
          <Autocomplete
            fullWidth
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={newSubstance}
            inputValue={searchQuery}
            onInputChange={handleInputChange}
            onChange={(_, value) => {
              if (value) {
                setNewSubstance(value);
              }
            }}
            renderInput={(params) => (
              <div ref={params.InputProps.ref}>
                <input
                  {...params.inputProps}
                  className="fr-input"
                  type="text"
                  placeholder={'Rechercher par libellé'}
                />
              </div>
            )}
            loading={isLoading || isFetching}
            loadingText={`Recherche en cours...`}
            filterOptions={(x) => x}
            options={substanceSearchResults}
            getOptionLabel={(option) => option.label}
            noOptionsText={
              searchQuery.length > 3
                ? 'Aucun résultat'
                : 'Saisir au moins 4 caractères'
            }
          />
          <Button
            iconId="fr-icon-add-line"
            priority="secondary"
            title="Ajouter"
            disabled={!newSubstance}
            onClick={async () => {
              await addSubstance(newSubstance as Substance);
            }}
            className={cx('fr-ml-2w')}
          />
        </div>
      )}

      <div className="fr-mt-1w">
        {filteredPrescriptionSubstances.map((prescriptionSubstance) => (
          <Tag
            key={`${prescriptionSubstance.prescriptionId}-${prescriptionSubstance.substance.code}`}
            dismissible={hasUserPrescriptionPermission(programmingPlan)?.update}
            small
            nativeButtonProps={
              hasUserPrescriptionPermission(programmingPlan)?.update
                ? {
                    onClick: async () => {
                      removeSubstance(prescriptionSubstance.substance);
                    }
                  }
                : undefined
            }
            className={cx('fr-m-1v')}
          >
            {prescriptionSubstance.substance.label}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionSubstancesSelect;

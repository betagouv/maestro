import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { isNil } from 'lodash-es';
import {
  type OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import {
  type ContaminationSource,
  ContaminationSourceLabels,
  ContaminationSourceList
} from 'maestro-shared/schema/Analysis/Residue/ContaminationSource';
import type { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  type ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList
} from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import type { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { AppMultiSelect } from '../../../../components/_app/AppMultiSelect/AppMultiSelect';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSelect from '../../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import type { UseForm } from '../../../../hooks/useForm';
import type { ResiduesLmrValidator } from './SampleAnalysisForm';

type Props = {
  form: UseForm<ResiduesLmrValidator>;
  programmingSubPlanCodeNat: string;
  residue: PartialResidue;
  residueIndex: number;
  onChangeResidue: (residue: PartialResidue, index: number) => void;
};

export const ResidueInterpretationForm: FunctionComponent<Props> = ({
  form,
  programmingSubPlanCodeNat,
  residue,
  residueIndex,
  onChangeResidue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  const hasLmr = !isNil(residue.lmr) && residue.lmr !== 0;
  return (
    <>
      <hr />
      <div className={clsx('result-detail-bloc')}>
        <h6 className={cx('fr-mb-0')}>Interprétation du résultat</h6>

        <div className={clsx('result-detail-bloc')}>
          {hasLmr && (
            <>
              <AppSelect
                className={cx('fr-mb-0')}
                value={residue.resultHigherThanArfd ?? ''}
                options={selectOptionsFromList(OptionalBooleanList, {
                  labels: OptionalBooleanLabels
                })}
                onChange={(e) =>
                  onChangeResidue(
                    {
                      ...residue,
                      resultHigherThanArfd: e.target.value as OptionalBoolean
                    },
                    residueIndex
                  )
                }
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'resultHigherThanArfd']}
                whenValid="Valeur correctement renseignée"
                label="Résultat brut entrainant un dépassement de l'Arfd ?"
              />
              <AppTextInput
                className={cx('fr-mb-0')}
                value={residue.notesOnResult ?? ''}
                onChange={(e) =>
                  onChangeResidue(
                    { ...residue, notesOnResult: e.target.value },
                    residueIndex
                  )
                }
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'notesOnResult']}
                whenValid="Note interne correctement renseignée"
                label="Note interne"
              />

              {residue.resultHigherThanArfd === 'true' && (
                <Alert
                  severity="warning"
                  small
                  description="Alerte risque consommateur"
                />
              )}
            </>
          )}
          {programmingSubPlanCodeNat === 'PPV' && (
            <>
              <hr />
              <AppSelect
                className={cx('fr-mb-0')}
                value={residue.substanceApproved ?? ''}
                options={selectOptionsFromList(OptionalBooleanList, {
                  labels: OptionalBooleanLabels
                })}
                onChange={(e) =>
                  onChangeResidue(
                    {
                      ...residue,
                      substanceApproved: e.target.value as OptionalBoolean
                    },
                    residueIndex
                  )
                }
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'substanceApproved']}
                whenValid="Valeur correctement renseignée"
                label="Substance approuvée dans l'UE"
                required
              />
              <hr />
              <AppSelect
                className={cx('fr-mb-0')}
                value={residue.substanceAuthorised ?? ''}
                options={selectOptionsFromList(OptionalBooleanList, {
                  labels: OptionalBooleanLabels
                })}
                onChange={(e) =>
                  onChangeResidue(
                    {
                      ...residue,
                      substanceAuthorised: e.target.value as OptionalBoolean
                    },
                    residueIndex
                  )
                }
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'substanceAuthorised']}
                whenValid="Valeur correctement renseignée"
                label="Substance autorisée pour l'usage"
                required
              />
              <hr />
              <div>
                <AppMultiSelect
                  values={residue.contaminationSources ?? []}
                  onChange={(values) =>
                    onChangeResidue(
                      {
                        ...residue,
                        contaminationSources: values as ContaminationSource[]
                      },
                      residueIndex
                    )
                  }
                  items={ContaminationSourceList}
                  keysWithLabels={ContaminationSourceLabels}
                  defaultLabel="source sélectionnée"
                  defaultEmptyLabel="Sélectionner une source"
                  withSort={false}
                  inputForm={form}
                  inputKey="residues"
                  inputPathFromKey={[residueIndex, 'contaminationSources']}
                  whenValid="Sources correctement renseignées"
                  label="Source(s) de contamination"
                />
                {residue.contaminationSources &&
                  residue.contaminationSources.length > 0 && (
                    <AppTextAreaInput
                      defaultValue={residue.notesOnContaminationSources ?? ''}
                      onChange={(e) =>
                        onChangeResidue(
                          {
                            ...residue,
                            notesOnContaminationSources: e.target.value
                          },
                          residueIndex
                        )
                      }
                      rows={1}
                      inputForm={form}
                      inputKey="residues"
                      inputPathFromKey={[
                        residueIndex,
                        'notesOnContaminationSources'
                      ]}
                      whenValid="Informations correctement renseignées"
                      label="Informations / Compléments"
                      hintText="Champ obligatoire en cas de sélection d'une ou plusieurs sources de contamination"
                      required
                    />
                  )}
              </div>
            </>
          )}
        </div>
      </div>
      <hr />
      <div className={clsx('result-detail-bloc')}>
        <h6 className={cx('fr-mb-0')}>Conformité</h6>
        <div>
          <AppRadioButtons
            legend="Conformité pour le résidu"
            options={selectOptionsFromList(ResidueComplianceList, {
              labels: ResidueComplianceLabels,
              withDefault: false,
              withSort: false
            }).map(({ label, value }) => ({
              key: `residue-${residueIndex}-compliance-option-${value}`,
              label,
              nativeInputProps: {
                checked: residue.compliance === value,
                onChange: () =>
                  onChangeResidue(
                    {
                      ...residue,
                      compliance: value as ResidueCompliance,
                      otherCompliance: null
                    },
                    residueIndex
                  )
              }
            }))}
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'compliance']}
            whenValid="Conformité correctement renseignée"
            required
          />
          {residue.compliance === 'Other' && (
            <AppTextAreaInput
              className={cx('fr-mt-2w')}
              defaultValue={residue.otherCompliance ?? ''}
              onChange={(e) =>
                onChangeResidue(
                  {
                    ...residue,
                    otherCompliance: e.target.value
                  },
                  residueIndex
                )
              }
              inputForm={form}
              inputKey="residues"
              inputPathFromKey={[residueIndex, 'otherCompliance']}
              whenValid="Valeur correctement renseignée"
              label="Précisions supplémentaires"
              hintText="Champ obligatoire pour expliquer la conformité “Autre”"
              required
            />
          )}
        </div>
      </div>
    </>
  );
};

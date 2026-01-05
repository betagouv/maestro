import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList
} from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSelect from '../../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../../components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { UseForm } from '../../../../hooks/useForm';
import { ResiduesLmrValidator } from './SampleAnalysisForm';

type Props = {
  form: UseForm<ResiduesLmrValidator>;
  residue: PartialResidue;
  residueIndex: number;
  onChangeResidue: (residue: PartialResidue, index: number) => void;
};

export const ResidueInterpretationForm: FunctionComponent<Props> = ({
  form,
  residue,
  residueIndex,
  onChangeResidue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();
  return (
    <>
      <hr />
      <div className={clsx('result-detail-bloc')}>
        <h6 className={cx('fr-mb-0')}>Interprétation du résultat</h6>

        <div className={clsx('result-detail-bloc')}>
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
          <AppSelect
            className={cx('fr-mb-0')}
            value={residue.pollutionRisk ?? ''}
            options={selectOptionsFromList(OptionalBooleanList, {
              labels: OptionalBooleanLabels
            })}
            onChange={(e) =>
              onChangeResidue(
                {
                  ...residue,
                  pollutionRisk: e.target.value as OptionalBoolean
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'pollutionRisk']}
            whenValid="Valeur correctement renseignée"
            label="Pollution environnementale probable"
          />
          <AppTextInput
            className={cx('fr-mb-0')}
            value={residue.notesOnPollutionRisk ?? ''}
            onChange={(e) =>
              onChangeResidue(
                {
                  ...residue,
                  notesOnPollutionRisk: e.target.value
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'notesOnPollutionRisk']}
            whenValid="Note interne correctement renseignée"
            label="Note interne"
          />
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

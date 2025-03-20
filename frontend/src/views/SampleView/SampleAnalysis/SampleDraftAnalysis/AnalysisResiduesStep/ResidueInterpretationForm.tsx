import React, { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import AppSelect from '../../../../../components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from '../../../../../components/_app/AppSelect/AppSelectOption';
import {
  OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import AppTextInput from '../../../../../components/_app/AppTextInput/AppTextInput';
import AppRadioButtons from '../../../../../components/_app/AppRadioButtons/AppRadioButtons';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList
} from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import AppTextAreaInput from '../../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { UseForm } from '../../../../../hooks/useForm';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';
import warning from '../../../../../assets/illustrations/warning.svg';
import { Form } from './AnalysisResiduesForm';

export type Props = {

  form: UseForm<Form>;
  residue: PartialResidue
  residueIndex: number
  onChangeResidue: (residue: PartialResidue, index: number) => void
};

const ResidueComplianceIllustrations: Record<ResidueCompliance, any> = {
  Compliant: check,
  NonCompliant: close,
  Other: warning
};

type SchemaFormType = Props['form']['schema']
type FormShape = SchemaFormType extends {shape: unknown} ? SchemaFormType['shape'] :  SchemaFormType['_type']

export const ResidueInterpretationForm: FunctionComponent<Props> = ({ form, residue, residueIndex, onChangeResidue,  ..._rest }) => {
  assert<Equals<keyof typeof _rest, never>>();
  return (
    <>
      <h6 className={cx('fr-mb-0')}>
                      <span
                        className={clsx(
                          cx('fr-icon-test-tube-line', 'fr-mr-1w'),
                          'icon-grey'
                        )}
                      ></span>
        Interprétation du résultat
      </h6>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={residue.resultHigherThanArfd ?? ''}
            options={selectOptionsFromList(OptionalBooleanList, {
              labels: OptionalBooleanLabels
            })}
            onChange={(e) =>
              onChangeResidue(
                {
                  ...residue,
                  resultHigherThanArfd: e.target
                    .value as OptionalBoolean
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[
              residueIndex,
              'resultHigherThanArfd'
            ]}
            whenValid="Valeur correctement renseignée"
            label="Résultat brut supérieur à l'Arfd ?"
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput<FormShape>
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
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={residue.substanceApproved ?? ''}
            options={selectOptionsFromList(OptionalBooleanList, {
              labels: OptionalBooleanLabels
            })}
            onChange={(e) =>
              onChangeResidue(
                {
                  ...residue,
                  substanceApproved: e.target
                    .value as OptionalBoolean
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'substanceApproved']}
            whenValid="Valeur correctement renseignée"
            label="Substance approuvée dans l'UE"
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
            value={residue.substanceAuthorised ?? ''}
            options={selectOptionsFromList(OptionalBooleanList, {
              labels: OptionalBooleanLabels
            })}
            onChange={(e) =>
              onChangeResidue(
                {
                  ...residue,
                  substanceAuthorised: e.target
                    .value as OptionalBoolean
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[
              residueIndex,
              'substanceAuthorised'
            ]}
            whenValid="Valeur correctement renseignée"
            label="Substance autorisée pour l'usage"
          />
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppSelect<FormShape>
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
        </div>
        <div className={cx('fr-col-12', 'fr-col-sm-6')}>
          <AppTextInput<FormShape>
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
            inputPathFromKey={[
              residueIndex,
              'notesOnPollutionRisk'
            ]}
            whenValid="Note interne correctement renseignée"
            label="Note interne"
          />
        </div>
      </div>
      <hr />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppRadioButtons
            legend="Conformité pour le résidu"
            options={selectOptionsFromList(
              ResidueComplianceList,
              {
                labels: ResidueComplianceLabels,
                withDefault: false,
                withSort: false
              }
            ).map(({ label, value }) => ({
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
              },
              illustration: (
                <img
                  src={
                    ResidueComplianceIllustrations[
                      value as ResidueCompliance
                      ]
                  }
                  alt=""
                  aria-hidden
                />
              )
            }))}
            colSm={6}
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'compliance']}
            whenValid="Conformité correctement renseignée"
            required
          />
        </div>
        {residue.compliance === 'Other' && (
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput<FormShape>
              rows={1}
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
          </div>
        )}
      </div>
    </>)
};
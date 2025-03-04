import React, { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Button from '@codegouvfr/react-dsfr/Button';
import AppRadioButtons from '../../../../../components/_app/AppRadioButtons/AppRadioButtons';
import { selectOptionsFromList } from '../../../../../components/_app/AppSelect/AppSelectOption';
import {
  AnalysisMethod,
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ResidueKind, ResidueKindLabels, ResidueKindList } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import SimpleResidueForm from './SimpleResidueForm';
import ComplexResidueForm from './ComplexResidueForm';
import AppSelect from '../../../../../components/_app/AppSelect/AppSelect';
import {
  OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList
} from 'maestro-shared/referential/OptionnalBoolean';
import AppTextInput from '../../../../../components/_app/AppTextInput/AppTextInput';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList
} from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import AppTextAreaInput from '../../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { undefined } from 'zod';
import { Analysis, PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { useForm } from '../../../../../hooks/useForm';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';
import warning from '../../../../../assets/illustrations/warning.svg';

export type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'id' | 'residues'>
  onBack: () => Promise<void>
  onValidate: (residues: Analysis['residues']) => Promise<void>
};
export const AnalysisResiduesForm: FunctionComponent<Props> = ({ partialAnalysis, onBack, onValidate, ...rest }) => {
  assert<Equals<keyof typeof rest, never>>();


  const [residues, setResidues] = useState(partialAnalysis.residues ?? []);

  const Form = Analysis.pick({
    residues: true
  });

  type FormShape = typeof Form.shape;

  const changeResidue = (residue: PartialResidue, index: number) => {
    const newResidues = [...residues];
    newResidues[index] = residue;
    setResidues(newResidues);
  };

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (inputValidated) => {
      await onValidate(inputValidated.residues)
    });
  };

  const form = useForm(Form, {
    residues
  });

  const ResidueComplianceIllustrations: Record<ResidueCompliance, any> = {
    Compliant: check,
    NonCompliant: close,
    Other: warning
  };

  return (
    <div {...rest}>
      <ToggleSwitch
        label="Des résidus sont-ils identifiés dans ce prélèvement ?"
        checked={residues.length > 0}
        onChange={(checked) => {
          if (checked) {
            setResidues([
              {
                analysisId: partialAnalysis.id,
                residueNumber: 1
              }
            ]);
          } else {
            setResidues([]);
          }
        }}
        showCheckedHint={false}
        labelPosition="left"
      />
      {residues.length > 0 && (
        <>
          {residues?.map((residue, residueIndex) => (
            <div key={`residue-${residueIndex}`} className="residue-container">
              <div
                className={clsx(
                  cx('fr-icon-microscope-line', 'fr-mr-1w'),
                  'icon-grey'
                )}
              ></div>
              <div
                className={clsx(cx('fr-container', 'fr-px-0'), 'residue-form')}
              >
                <h5>
                  <div>Résidu n°{residueIndex + 1}</div>
                  {residueIndex > 0 && (
                    <>
                      <div className="border-middle"></div>
                      <Button
                        title="Supprimer"
                        iconId="fr-icon-delete-line"
                        priority="tertiary"
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          setResidues(
                            residues.filter((_, i) => i !== residueIndex)
                          );
                        }}
                        className={cx('fr-mt-0')}
                      />
                    </>
                  )}
                </h5>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppRadioButtons<FormShape>
                      legend="Méthode d’analyse"
                      options={selectOptionsFromList(AnalysisMethodList, {
                        labels: AnalysisMethodLabels,
                        withDefault: false
                      }).map(({ label, value }) => ({
                        key: `residue-${residueIndex}-analysisMethod-option-${value}`,
                        label,
                        nativeInputProps: {
                          checked: residue.analysisMethod === value,
                          onChange: () =>
                            changeResidue(
                              {
                                ...residue,
                                analysisMethod: value as AnalysisMethod
                              },
                              residueIndex
                            )
                        }
                      }))}
                      colSm={6}
                      inputForm={form}
                      inputKey="residues"
                      inputPathFromKey={[residueIndex, 'analysisMethod']}
                      whenValid="Méthode d’analyse correctement renseignée"
                      required
                    />
                  </div>
                </div>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppRadioButtons<FormShape>
                      legend="Type de résidu"
                      options={selectOptionsFromList(ResidueKindList, {
                        labels: ResidueKindLabels,
                        withDefault: false,
                        withSort: false
                      }).map(({ label, value }) => ({
                        key: `residue-${residueIndex}-kind-option-${value}`,
                        label,
                        nativeInputProps: {
                          checked: residue.kind === value,
                          onChange: () =>
                            changeResidue(
                              {
                                ...residue,
                                kind: value as ResidueKind,
                                analytes:
                                  value === 'Complex'
                                    ? [
                                      {
                                        analysisId: partialAnalysis.id,
                                        residueNumber: residueIndex + 1,
                                        analyteNumber: 1
                                      }
                                    ]
                                    : null
                              },
                              residueIndex
                            )
                        }
                      }))}
                      colSm={6}
                      inputForm={form}
                      inputKey="residues"
                      inputPathFromKey={[residueIndex, 'kind']}
                      whenValid="Type de résidu correctement renseigné"
                      required
                    />
                  </div>
                </div>
                {residue.kind === 'Simple' && (
                  <SimpleResidueForm<FormShape>
                    form={form}
                    residue={residue}
                    residueIndex={residueIndex}
                    changeResidue={changeResidue}
                  />
                )}
                {residue.kind === 'Complex' && (
                  <ComplexResidueForm<FormShape>
                    form={form}
                    residue={residue}
                    residueIndex={residueIndex}
                    changeResidue={changeResidue}
                  />
                )}
                {residue.kind && (
                  <>
                    <hr />
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
                            changeResidue(
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
                            changeResidue(
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
                            changeResidue(
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
                            changeResidue(
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
                            changeResidue(
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
                            changeResidue(
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
                        <AppRadioButtons<FormShape>
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
                                changeResidue(
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
                              changeResidue(
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
                  </>
                )}
              </div>
            </div>
          ))}
        </>
      )}
      <hr />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <ul
            className={cx(
              'fr-btns-group',
              'fr-btns-group--inline-md',
              'fr-btns-group--between',
              'fr-btns-group--icon-left'
            )}
          >
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={[
                  {
                    priority: 'tertiary',
                    onClick: async (e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      await onBack()
                    },
                    title: 'Retour',
                    iconId: 'fr-icon-arrow-left-line'
                  }
                ]}
              />
            </li>
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={
                  [
                    residues.length > 0
                      ? {
                        children: 'Ajouter un résidu',
                        iconId: 'fr-icon-microscope-fill',
                        priority: 'secondary',
                        onClick: () =>
                          setResidues([
                            ...residues,
                            {
                              analysisId: partialAnalysis.id,
                              residueNumber: residues.length + 1
                            }
                          ])
                      }
                      : undefined,
                    {
                      children: 'Continuer',
                      onClick: submit,
                      iconId: 'fr-icon-arrow-right-line',
                      iconPosition: 'right'
                    }
                  ].filter((_) => _ !== undefined) as any
                }
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
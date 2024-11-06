import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OptionalBoolean,
  OptionalBooleanLabels,
  OptionalBooleanList,
} from 'shared/referential/OptionnalBoolean';
import { Analysis, PartialAnalysis } from 'shared/schema/Analysis/Analysis';
import {
  AnalysisKind,
  AnalysisKindLabels,
  AnalysisKindList,
} from 'shared/schema/Analysis/AnalysisKind';
import { PartialResidue } from 'shared/schema/Analysis/Residue/Residue';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList,
} from 'shared/schema/Analysis/Residue/ResidueCompliance';
import {
  ResidueKind,
  ResidueKindLabels,
  ResidueKindList,
} from 'shared/schema/Analysis/Residue/ResidueKind';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
import ComplexResidueForm from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisResiduesStep/ComplexResidueForm';
import SimpleResidueForm from 'src/views/SampleView/SampleAnalysis/SampleDraftAnalysis/AnalysisResiduesStep/SimpleResidueForm';
import { undefined } from 'zod';
import check from '../../../../../assets/illustrations/check.svg';
import close from '../../../../../assets/illustrations/close.svg';
import warning from '../../../../../assets/illustrations/warning.svg';
import '../SampleDraftAnalysis.scss';
interface Props {
  partialAnalysis: PartialAnalysis;
}

const AnalysisResiduesStep = ({ partialAnalysis }: Props) => {
  const navigate = useNavigate();
  const [updateAnalysis] = useUpdateAnalysisMutation();

  const [analysisKind, setAnalysisKind] = useState(
    partialAnalysis?.kind ?? 'Mono'
  );
  const [residues, setResidues] = useState(partialAnalysis.residues ?? []);

  const Form = Analysis.pick({
    kind: true,
    residues: true,
  });

  type FormShape = typeof Form.shape;

  const changeResidue = (residue: PartialResidue, index: number) => {
    const newResidues = [...residues];
    newResidues[index] = residue;
    setResidues(newResidues);
  };

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await updateAnalysis({
        ...partialAnalysis,
        kind: analysisKind,
        residues,
        status: 'Compliance',
      });
      navigate(`/prelevements/${partialAnalysis.sampleId}/analyse?etape=3`, {
        replace: true,
      });
    });
  };

  const form = useForm(Form, {
    kind: analysisKind,
    residues,
  });

  const ResidueComplianceIllustrations: Record<ResidueCompliance, any> = {
    Compliant: check,
    NonCompliant: close,
    Other: warning,
  };

  return (
    <>
      <ToggleSwitch
        label="Des résidus sont-ils identifiés dans ce prélèvement ?"
        checked={residues.length > 0}
        onChange={(checked) => {
          if (checked) {
            setResidues([
              {
                analysisId: partialAnalysis.id,
                residueNumber: 1,
              },
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
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppRadioButtons<FormShape>
                legend="Méthode d’analyse"
                options={selectOptionsFromList(AnalysisKindList, {
                  labels: AnalysisKindLabels,
                  withDefault: false,
                }).map(({ label, value }) => ({
                  key: `analysisKind-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: analysisKind === value,
                    onChange: () => setAnalysisKind(value as AnalysisKind),
                  },
                }))}
                colSm={6}
                inputForm={form}
                inputKey="kind"
                whenValid="Méthode d’analyse correctement renseignée"
                required
              />
            </div>
          </div>
          <hr />
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
                      legend="Type de résidu"
                      options={selectOptionsFromList(ResidueKindList, {
                        labels: ResidueKindLabels,
                        withDefault: false,
                        withSort: false,
                      }).map(({ label, value }) => ({
                        key: `residueKind-option-${value}`,
                        label,
                        nativeInputProps: {
                          checked: residue.kind === value,
                          onChange: () =>
                            changeResidue(
                              {
                                analysisId: residue.analysisId,
                                residueNumber: residue.residueNumber,
                                kind: value as ResidueKind,
                                analytes:
                                  value === 'Complex'
                                    ? [
                                        {
                                          analysisId: partialAnalysis.id,
                                          residueNumber: residueIndex + 1,
                                          analyteNumber: 1,
                                        },
                                      ]
                                    : null,
                              },
                              residueIndex
                            ),
                        },
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
                            labels: OptionalBooleanLabels,
                          })}
                          onChange={(e) =>
                            changeResidue(
                              {
                                ...residue,
                                resultHigherThanArfd: e.target
                                  .value as OptionalBoolean,
                              },
                              residueIndex
                            )
                          }
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[
                            residueIndex,
                            'resultHigherThanArfd',
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
                            labels: OptionalBooleanLabels,
                          })}
                          onChange={(e) =>
                            changeResidue(
                              {
                                ...residue,
                                substanceApproved: e.target
                                  .value as OptionalBoolean,
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
                            labels: OptionalBooleanLabels,
                          })}
                          onChange={(e) =>
                            changeResidue(
                              {
                                ...residue,
                                substanceAuthorised: e.target
                                  .value as OptionalBoolean,
                              },
                              residueIndex
                            )
                          }
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[
                            residueIndex,
                            'substanceAuthorised',
                          ]}
                          whenValid="Valeur correctement renseignée"
                          label="Substance autorisée pour l'usage"
                        />
                      </div>
                      <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                        <AppSelect<FormShape>
                          value={residue.pollutionRisk ?? ''}
                          options={selectOptionsFromList(OptionalBooleanList, {
                            labels: OptionalBooleanLabels,
                          })}
                          onChange={(e) =>
                            changeResidue(
                              {
                                ...residue,
                                pollutionRisk: e.target
                                  .value as OptionalBoolean,
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
                                notesOnPollutionRisk: e.target.value,
                              },
                              residueIndex
                            )
                          }
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[
                            residueIndex,
                            'notesOnPollutionRisk',
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
                              withSort: false,
                            }
                          ).map(({ label, value }) => ({
                            key: `residueCompliance-option-${value}`,
                            label,
                            nativeInputProps: {
                              checked: residue.compliance === value,
                              onChange: () =>
                                changeResidue(
                                  {
                                    ...residue,
                                    compliance: value as ResidueCompliance,
                                  },
                                  residueIndex
                                ),
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
                            ),
                          }))}
                          colSm={6}
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[residueIndex, 'compliance']}
                          whenValid="Conformité correctement renseignée"
                          required
                        />
                      </div>
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
                      await updateAnalysis({
                        ...partialAnalysis,
                        status: 'Report',
                      });
                      navigate(
                        `/prelevements/${partialAnalysis.sampleId}?etape=1`,
                        {
                          replace: true,
                        }
                      );
                    },
                    title: 'Retour',
                    iconId: 'fr-icon-arrow-left-line',
                  },
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
                                residueNumber: residues.length + 1,
                              },
                            ]),
                        }
                      : undefined,
                    {
                      children: 'Continuer',
                      onClick: submit,
                      iconId: 'fr-icon-arrow-right-line',
                      iconPosition: 'right',
                    },
                  ].filter((_) => _ !== undefined) as any
                }
              />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AnalysisResiduesStep;

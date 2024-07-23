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
import {
  SimpleResidue,
  SimpleResidueList,
} from 'shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from 'shared/referential/Residue/SimpleResidueLabels';
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
import {
  ResultKind,
  ResultKindLabels,
  ResultKindList,
} from 'shared/schema/Analysis/Residue/ResultKind';
import { isDefinedAndNotNull } from 'shared/utils/utils';
import ResidueResultAlert from 'src/components/ResidueResultAlert/ResidueResultAlert';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
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
                kind: 'Simple',
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
            <div key={residueIndex} className="residue-container">
              <div className={cx('fr-icon-microscope-line')}></div>
              <div className={clsx(cx('fr-container'), 'residue-form')}>
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
                        className={clsx(cx('fr-mt-0'), 'float-right')}
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
                              { ...residue, kind: value as ResidueKind },
                              residueIndex
                            ),
                          disabled: value === 'Complexe',
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
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppSelect<FormShape>
                      value={residue.reference ?? ''}
                      options={selectOptionsFromList(SimpleResidueList, {
                        labels: SimpleResidueLabels,
                      })}
                      onChange={(e) =>
                        changeResidue(
                          {
                            ...residue,
                            reference: e.target.value as SimpleResidue,
                          },
                          residueIndex
                        )
                      }
                      inputForm={form}
                      inputKey="residues"
                      inputPathFromKey={[residueIndex, 'reference']}
                      whenValid="Résidu correctement renseigné"
                      label="Résidu selon définition"
                      required
                    />
                  </div>
                </div>
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppSelect<FormShape>
                      value={residue.resultKind ?? ''}
                      options={selectOptionsFromList(ResultKindList, {
                        labels: ResultKindLabels,
                      })}
                      onChange={(e) =>
                        changeResidue(
                          {
                            ...residue,
                            resultKind: e.target.value as ResultKind,
                          },
                          residueIndex
                        )
                      }
                      inputForm={form}
                      inputKey="residues"
                      inputPathFromKey={[residueIndex, 'resultKind']}
                      whenValid="Type de résultat correctement renseigné"
                      label="Type de résultat de l'analyse"
                      required
                    />
                  </div>
                  {residue.resultKind === 'Q' && (
                    <>
                      <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                        <AppTextInput<FormShape>
                          value={residue.result ?? ''}
                          onChange={(e) =>
                            changeResidue(
                              { ...residue, result: Number(e.target.value) },
                              residueIndex
                            )
                          }
                          type="number"
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[residueIndex, 'result']}
                          whenValid="Valeur correctement renseignée"
                          label="Valeur numérique du résultat"
                          hintText="En mg/kg"
                          min={0}
                          required
                        />
                      </div>
                      <div className={cx('fr-col-12', 'fr-col-sm-6')}>
                        <AppTextInput<FormShape>
                          value={residue.lmr ?? ''}
                          onChange={(e) =>
                            changeResidue(
                              { ...residue, lmr: Number(e.target.value) },
                              residueIndex
                            )
                          }
                          type="number"
                          inputForm={form}
                          inputKey="residues"
                          inputPathFromKey={[residueIndex, 'lmr']}
                          whenValid="Valeur correctement renseignée"
                          label="Valeur de la LMR"
                          hintText="En mg/kg"
                          min={0}
                          required
                        />
                      </div>
                      {isDefinedAndNotNull(residue.result) &&
                        isDefinedAndNotNull(residue.lmr) && (
                          <div className={cx('fr-col-12')}>
                            <ResidueResultAlert
                              result={residue.result}
                              lmr={residue.lmr}
                            />
                          </div>
                        )}
                    </>
                  )}
                </div>
                <hr />
                <h6 className={cx('fr-mb-0')}>
                  <span
                    className={cx('fr-icon-test-tube-line', 'fr-mr-1w')}
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
                      inputPathFromKey={[residueIndex, 'resultHigherThanArfd']}
                      whenValid="Valeur correctement renseignée"
                      label="Résultat brut supérieur à l'Arfd ?"
                      required
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
                      required
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
                      inputPathFromKey={[residueIndex, 'substanceAuthorised']}
                      whenValid="Valeur correctement renseignée"
                      label="Substance autorisée pour l'usage"
                      required
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
                            pollutionRisk: e.target.value as OptionalBoolean,
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
                          { ...residue, notesOnPollutionRisk: e.target.value },
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
                <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
                  <div className={cx('fr-col-12')}>
                    <AppRadioButtons<FormShape>
                      legend="Conformité pour le résidu"
                      options={selectOptionsFromList(ResidueComplianceList, {
                        labels: ResidueComplianceLabels,
                        withDefault: false,
                        withSort: false,
                      }).map(({ label, value }) => ({
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
                                kind: 'Simple',
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

import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import clsx from 'clsx';
import React, { useState } from 'react';
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
import { PartialResidue } from 'shared/schema/Analysis/Residue';
import {
  ResidueCompliance,
  ResidueComplianceLabels,
  ResidueComplianceList,
} from 'shared/schema/Analysis/ResidueCompliance';
import {
  ResidueKind,
  ResidueKindLabels,
  ResidueKindList,
} from 'shared/schema/Analysis/ResidueKind';
import {
  ResultKind,
  ResultKindLabels,
  ResultKindList,
} from 'shared/schema/Analysis/ResultKind';
import AppRadioButtons from 'src/components/_app/AppRadioButtons/AppRadioButtons';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useUpdateAnalysisMutation } from 'src/services/analysis.service';
import check from '../../../assets/illustrations/check.svg';
import close from '../../../assets/illustrations/close.svg';
import warning from '../../../assets/illustrations/warning.svg';
import './SampleAnalysis.scss';

interface Props {
  analysis: PartialAnalysis;
}

const AnalysisResiduesStep = ({ analysis }: Props) => {
  const [updateAnalysis] = useUpdateAnalysisMutation();

  const [analysisKind, setAnalysisKind] = useState(analysis?.kind);
  const [residues, setResidues] = useState(analysis.residues ?? []);

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
        ...analysis,
        kind: analysisKind,
        residues,
      })
        .unwrap()
        .then((result) => {
          console.log('updateAnalysis', result);
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
                analysisId: analysis.id,
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
                  <div className={cx('fr-col-12', 'fr-col-sm-6')}>
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
                      hint="Blabla"
                      required
                    />
                  </div>
                  {residue.resultKind === 'Q' && (
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
                  )}
                </div>
                <hr />
                <h6 className={cx('fr-mb-0')}>Interprétation du résultat</h6>
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
          <hr />
          <ButtonsGroup
            buttons={[
              {
                children: 'Ajouter un résidu',
                iconId: 'fr-icon-microscope-line',
                priority: 'secondary',
                onClick: () =>
                  setResidues([
                    ...residues,
                    {
                      analysisId: analysis.id,
                      residueNumber: residues.length + 1,
                    },
                  ]),
              },
              {
                children: 'Continuer',
                iconId: 'fr-icon-arrow-right-line',
                iconPosition: 'right',
                onClick: submit,
              },
            ]}
          />
        </>
      )}
    </>
  );
};

export default AnalysisResiduesStep;

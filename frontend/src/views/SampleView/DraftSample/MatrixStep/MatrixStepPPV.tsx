import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { isNil } from 'lodash-es';
import {
  CultureKind,
  CultureKindLabels,
  CultureKindList
} from 'maestro-shared/referential/CultureKind';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  OtherMatrixKind
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  MatrixPart,
  MatrixPartLabels,
  MatrixPartList
} from 'maestro-shared/referential/Matrix/MatrixPart';
import { Stage } from 'maestro-shared/referential/Stage';
import {
  isOutsideProgrammingPlanSample,
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  prescriptionSubstancesCheck,
  sampleMatrixCheck,
  SampleMatrixData,
  SampleMatrixSpecificDataPPV
} from 'maestro-shared/schema/Sample/Sample';
import {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import {
  AppSelectOption,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { unknown, z } from 'zod/v4';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import SubstanceSearch from '../../../../components/SubstanceSearch/SubstanceSearch';
import { useForm } from '../../../../hooks/useForm';
import { MatrixStepRef } from './MatrixStep';

const SampleMatrixPPVData = SampleMatrixData.omit({
  documentIds: true,
  laboratoryId: true
}).extend({
  specificData: SampleMatrixSpecificDataPPV
});

type SampleMatrixPPVData = z.infer<typeof SampleMatrixPPVData>;

export type PartialSamplePPV = (PartialSample | PartialSampleToCreate) & {
  specificData: Extract<
    PartialSampleMatrixSpecificData,
    { programmingPlanKind: 'PPV' }
  >;
};

type Props = {
  partialSample: PartialSamplePPV;
  matrixKindOptions: AppSelectOption[];
  stageOptions: AppSelectOption[];
  onSave: (sampleMatrixData: SampleMatrixPPVData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
};

const MatrixStepPPV = forwardRef<MatrixStepRef, Props>(
  (
    {
      partialSample,
      matrixKindOptions,
      stageOptions,
      onSave,
      onSubmit,
      renderSampleAttachments
    },
    ref
  ) => {
    const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
    const [matrix, setMatrix] = useState(partialSample.matrix);
    const [stage, setStage] = useState(partialSample.stage);
    const [notesOnMatrix, setNotesOnMatrix] = useState(
      partialSample.notesOnMatrix
    );

    const [matrixDetails, setMatrixDetails] = useState(
      partialSample.specificData.matrixDetails
    );
    const [matrixPart, setMatrixPart] = useState(
      partialSample.specificData.matrixPart
    );
    const [cultureKind, setCultureKind] = useState(
      partialSample.specificData.cultureKind
    );
    const [releaseControl, setReleaseControl] = useState(
      partialSample.specificData.releaseControl
    );
    const [monoSubstances, setMonoSubstances] = useState(
      partialSample.monoSubstances ?? null
    );
    const [multiSubstances, setMultiSubstances] = useState(
      partialSample.multiSubstances ?? null
    );

    const specificData = useMemo(
      () => ({
        programmingPlanKind: 'PPV',
        matrixPart,
        matrixDetails,
        cultureKind,
        releaseControl
      }),
      [matrixPart, matrixDetails, cultureKind, releaseControl]
    );

    const save = async () =>
      onSave({
        matrixKind,
        matrix,
        stage,
        specificData,
        notesOnMatrix,
        monoSubstances,
        multiSubstances
      } as SampleMatrixPPVData);

    const form = useForm(
      SampleMatrixPPVData.check(prescriptionSubstancesCheck, sampleMatrixCheck),
      {
        matrixKind,
        matrix,
        stage,
        specificData,
        notesOnMatrix,
        prescriptionId: partialSample.prescriptionId,
        monoSubstances,
        multiSubstances,
        substances: unknown
      },
      save
    );

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.validate(async () => {
          await onSubmit();
        });
      }
    }));

    return (
      <>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSearchInput
              value={matrixKind ?? ''}
              options={matrixKindOptions}
              placeholder="Sélectionner une catégorie"
              onSelect={(value) => {
                setMatrixKind(value as MatrixKind);
                setMatrix(null);
                setStage(null);
              }}
              state={form.messageType('matrixKind')}
              stateRelatedMessage={form.message('matrixKind')}
              whenValid="Type de matrice correctement renseignée."
              label="Catégorie de matrice programmée"
              required={matrixKind !== OtherMatrixKind.value}
              inputProps={{
                disabled: matrixKind === OtherMatrixKind.value,
                'data-testid': 'matrix-kind-select'
              }}
            />
            {isOutsideProgrammingPlanSample(partialSample) && (
              <Checkbox
                options={[
                  {
                    label: 'Autre matrice non répertoriée',
                    nativeInputProps: {
                      checked: matrixKind === OtherMatrixKind.value,
                      onChange: (e) => {
                        if (e.target.checked) {
                          setMatrixKind(OtherMatrixKind.value);
                          setMatrix(null);
                        } else {
                          setMatrixKind(null);
                          setMatrix(null);
                        }
                      }
                    }
                  }
                ]}
              />
            )}
          </div>
          <div
            className={cx('fr-col-12', 'fr-col-sm-6', {
              'fr-mt-12w': matrixKind === OtherMatrixKind.value
            })}
          >
            {matrixKind === OtherMatrixKind.value ? (
              <AppTextInput
                defaultValue={matrix ?? ''}
                onChange={(e) => setMatrix(e.target.value)}
                inputForm={form}
                inputKey="matrix"
                whenValid="Matrice correctement renseignée."
                required
                label="Matrice"
              />
            ) : (
              <AppSearchInput
                value={matrix ?? ''}
                options={selectOptionsFromList(
                  matrixKind
                    ? (MatrixListByKind[matrixKind as MatrixKind] ?? matrixKind)
                    : [],
                  {
                    labels: MatrixLabels,
                    withSort: true,
                    withDefault: false
                  }
                )}
                placeholder="Sélectionner une matrice"
                onSelect={(value) => {
                  setMatrix(value as Matrix);
                }}
                state={form.messageType('matrix')}
                stateRelatedMessage={form.message('matrix')}
                whenValid="Matrice correctement renseignée."
                data-testid="matrix-select"
                label="Matrice"
                required
                inputProps={{
                  'data-testid': 'matrix-select'
                }}
              />
            )}
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect
              value={stage ?? ''}
              options={stageOptions}
              onChange={(e) => setStage(e.target.value as Stage)}
              inputForm={form}
              inputKey="stage"
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement"
              required
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextInput
              defaultValue={matrixDetails ?? ''}
              onChange={(e) => setMatrixDetails(e.target.value)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['matrixDetails']}
              whenValid="Détail de la matrice correctement renseigné."
              data-testid="matrixdetails-input"
              label="Détail de la matrice"
              hintText="Champ facultatif pour précisions supplémentaires"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect
              defaultValue={cultureKind ?? ''}
              options={selectOptionsFromList(CultureKindList, {
                labels: CultureKindLabels,
                defaultLabel: 'Sélectionner un type de culture'
              })}
              onChange={(e) => setCultureKind(e.target.value as CultureKind)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['cultureKind']}
              whenValid="Type de culture correctement renseigné."
              data-testid="culturekind-select"
              label="Type de culture"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect
              defaultValue={matrixPart ?? ''}
              options={selectOptionsFromList(MatrixPartList, {
                labels: MatrixPartLabels,
                defaultLabel: 'Sélectionner une partie du végétal'
              })}
              onChange={(e) => setMatrixPart(e.target.value as MatrixPart)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['matrixPart']}
              whenValid="Partie du végétal correctement renseignée."
              data-testid="matrixpart-select"
              label="LMR / Partie du végétal concernée"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-mt-2w')}>
            <ToggleSwitch
              label="Contrôle libératoire"
              checked={releaseControl ?? false}
              onChange={(checked) => setReleaseControl(checked)}
              showCheckedHint={false}
            />
          </div>
          {!isProgrammingPlanSample(partialSample) && (
            <>
              <div className={cx('fr-col-12', 'fr-mt-2w', 'fr-pb-1v')}>
                <span className={cx('fr-text--md', 'fr-text--bold')}>
                  Analyses mono-résidu et/ou multi-résidus
                </span>
              </div>
              <div className={cx('fr-col-12')}>
                <Checkbox
                  options={[
                    {
                      label: 'Mono-résidu',
                      nativeInputProps: {
                        checked: !isNil(monoSubstances),
                        onChange: (e) => {
                          if (e.target.checked) {
                            setMonoSubstances([]);
                          } else {
                            setMonoSubstances(null);
                          }
                        }
                      }
                    }
                  ]}
                  className={cx('fr-mb-2w')}
                />
                {monoSubstances && (
                  <SubstanceSearch
                    label="Sélectionner la liste des mono-résidu"
                    analysisMethod="Mono"
                    substances={monoSubstances}
                    onChangeSubstances={setMonoSubstances}
                    addButtonMode="none"
                  />
                )}
                {form.hasIssue('monoSubstances') && (
                  <div className={cx('fr-error-text')}>
                    {form.message('monoSubstances')}
                  </div>
                )}
              </div>
              <div className={cx('fr-col-12')}>
                <Checkbox
                  options={[
                    {
                      label: 'Multi-résidus',
                      nativeInputProps: {
                        checked: !isNil(multiSubstances),
                        onChange: (e) => {
                          if (e.target.checked) {
                            setMultiSubstances([]);
                          } else {
                            setMultiSubstances(null);
                          }
                        }
                      }
                    }
                  ]}
                />
              </div>

              {form.hasIssue('substances') && (
                <div className={cx('fr-error-text', 'fr-mt-0')}>
                  {form.message('substances')}
                </div>
              )}
              <div className={cx('fr-col-12')}>
                <hr />
              </div>
            </>
          )}
        </div>
        {renderSampleAttachments?.()}
        <hr />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput
              defaultValue={notesOnMatrix ?? ''}
              onChange={(e) => setNotesOnMatrix(e.target.value)}
              inputForm={form}
              inputKey="notesOnMatrix"
              whenValid="Note correctement renseignée."
              data-testid="notes-input"
              label="Note additionnelle"
              hintText="Champ facultatif pour précisions supplémentaires (date de semis, précédent cultural, traitements faits, protocole de prélèvement et note inspecteur, etc.)"
            />
          </div>
        </div>
      </>
    );
  }
);

export default MatrixStepPPV;

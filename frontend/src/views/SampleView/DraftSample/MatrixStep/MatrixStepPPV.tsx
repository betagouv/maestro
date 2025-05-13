import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import {
  CultureKind,
  CultureKindLabels,
  CultureKindList
} from 'maestro-shared/referential/CultureKind';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  MatrixPart,
  MatrixPartLabels,
  MatrixPartList
} from 'maestro-shared/referential/Matrix/MatrixPart';
import {
  Stage,
  StageLabels,
  StagesByProgrammingPlanKind
} from 'maestro-shared/referential/Stage';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import {
  isProgrammingPlanSample,
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
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
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { z } from 'zod';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
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
  prescriptions: Prescription[];
  onSave: (sampleMatrixData: SampleMatrixPPVData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
};

const MatrixStepPPV = forwardRef<MatrixStepRef, Props>(
  (
    { partialSample, prescriptions, onSave, onSubmit, renderSampleAttachments },
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

    type FormShape = typeof SampleMatrixPPVData.shape;

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
        prescriptionId: prescriptions?.find(
          (p) =>
            p.programmingPlanKind === specificData.programmingPlanKind &&
            p.matrixKind === matrixKind &&
            stage &&
            p.stages.includes(stage)
        )?.id
      } as SampleMatrixPPVData);

    const form = useForm(
      SampleMatrixPPVData,
      {
        matrixKind,
        matrix,
        stage,
        specificData,
        notesOnMatrix,
        prescriptionId: partialSample.prescriptionId
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
              options={selectOptionsFromList(
                MatrixKindList.filter(
                  (matrixKind) =>
                    !isProgrammingPlanSample(partialSample) ||
                    prescriptions?.find(
                      (p) =>
                        p.programmingPlanKind ===
                          specificData.programmingPlanKind &&
                        p.matrixKind === matrixKind
                    )
                ),
                {
                  labels: MatrixKindLabels,
                  withSort: true,
                  withDefault: false
                }
              )}
              placeholder="Sélectionner une catégorie"
              onSelect={(value) => {
                setMatrixKind(value as MatrixKind);
                setMatrix(undefined);
                setStage(undefined);
              }}
              state={form.messageType('matrixKind')}
              stateRelatedMessage={form.message('matrixKind')}
              whenValid="Type de matrice correctement renseignée."
              label="Catégorie de matrice programmée"
              required
              inputProps={{
                'data-testid': 'matrix-kind-select'
              }}
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
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
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={stage ?? ''}
              options={selectOptionsFromList(
                StagesByProgrammingPlanKind[
                  partialSample.specificData.programmingPlanKind
                ].filter(
                  (stage) =>
                    !isProgrammingPlanSample(partialSample) ||
                    prescriptions.find(
                      (p) =>
                        p.programmingPlanKind ===
                          specificData.programmingPlanKind &&
                        p.matrixKind === matrixKind &&
                        p.stages.includes(stage)
                    )
                ),
                {
                  labels: StageLabels,
                  defaultLabel: 'Sélectionner un stade'
                }
              )}
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
            <AppTextInput<FormShape>
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
            <AppSelect<FormShape>
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
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
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
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <ToggleSwitch
              label="Contrôle libératoire"
              checked={releaseControl ?? false}
              onChange={(checked) => setReleaseControl(checked)}
              showCheckedHint={false}
            />
          </div>
        </div>

        {renderSampleAttachments?.()}
        <hr />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput<FormShape>
              rows={1}
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

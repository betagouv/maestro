import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  Species,
  SpeciesLabels,
  SpeciesList
} from 'maestro-shared/referential/Species';
import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import {
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  SampleMatrixData,
  SampleMatrixSpecificDataPFASEggs,
  SampleMatrixSpecificDataPFASMeat
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
import { z } from 'zod';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import { useForm } from '../../../../hooks/useForm';
import { MatrixStepRef } from './MatrixStep';

const SampleMatrixPFASData = SampleMatrixData.omit({
  documentIds: true,
  laboratoryId: true
}).extend({
  specificData:
    SampleMatrixSpecificDataPFASEggs || SampleMatrixSpecificDataPFASMeat
});

type SampleMatrixPFASData = z.infer<typeof SampleMatrixPFASData>;

export interface Props {
  partialSample: (PartialSample | PartialSampleToCreate) & {
    specificData: PartialSampleMatrixSpecificData & {
      programmingPlanKind: 'PFAS_EGGS' | 'PFAS_MEAT';
    };
  };
  prescriptions: Prescription[];
  onSave: (sampleMatrixData: SampleMatrixPFASData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
}

const MatrixStepPFAS = forwardRef<MatrixStepRef, Props>(
  (
    { partialSample, prescriptions, onSave, onSubmit, renderSampleAttachments },
    ref
  ) => {
    const [matrixKind, setMatrixKind] = useState(partialSample.matrixKind);
    const [matrix, setMatrix] = useState(partialSample.matrix);
    const [notesOnMatrix, setNotesOnMatrix] = useState(
      partialSample.notesOnMatrix
    );

    const [species, setSpecies] = useState(partialSample.specificData.species);

    const [killingCode, setKillingCode] = useState(
      partialSample.specificData.programmingPlanKind === 'PFAS_MEAT'
        ? partialSample.specificData.killingCode
        : undefined
    );

    const [targetingCriteria, setTargetingCriteria] = useState(
      partialSample.specificData.targetingCriteria
    );
    const [notesOnTargetingCriteria, setNotesOnTargetingCriteria] = useState(
      partialSample.specificData.notesOnTargetingCriteria
    );
    const [animalKind, setAnimalKind] = useState(
      partialSample.specificData.animalKind
    );
    const [productionKind, setProductionKind] = useState(
      partialSample.specificData.productionKind
    );
    const [identifier, setIdentifier] = useState(
      partialSample.specificData.identifier
    );
    const [breedingMethod, setBreedingMethod] = useState(
      partialSample.specificData.breedingMethod
    );
    const [age, setAge] = useState(partialSample.specificData.age);
    const [sex, setSex] = useState(partialSample.specificData.sex);
    const [seizure, setSeizure] = useState(partialSample.specificData.seizure);
    const [outdoorAccess, setOutdoorAccess] = useState(
      partialSample.specificData.outdoorAccess
    );
    const [stage, setStage] = useState(
      partialSample.specificData.programmingPlanKind === 'PFAS_EGGS'
        ? partialSample.specificData.stage
        : undefined
    );

    type FormShape = typeof SampleMatrixPFASData.shape;

    const specificData = useMemo(
      () => ({
        programmingPlanKind: partialSample.specificData.programmingPlanKind,
        species,
        targetingCriteria,
        notesOnTargetingCriteria,
        animalKind,
        productionKind,
        identifier,
        breedingMethod,
        age
      }),
      [
        species,
        targetingCriteria,
        notesOnTargetingCriteria,
        animalKind,
        productionKind,
        identifier,
        breedingMethod,
        age
      ]
    );

    const save = async () =>
      onSave({
        matrixKind,
        matrix,
        specificData,
        notesOnMatrix,
        prescriptionId: prescriptions?.find(
          (p) =>
            p.matrixKind === matrixKind && stage && p.stages.includes(stage)
        )?.id
      } as SampleMatrixPFASData);

    const form = useForm(
      SampleMatrixPFASData,
      {
        matrixKind,
        matrix,
        specificData,
        notesOnMatrix,
        prescriptionId: partialSample.prescriptionId
      },
      save
    );

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.validate(async () => {
          await save();
          await onSubmit();
        });
      }
    }));

    return (
      <>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={species ?? ''}
              options={selectOptionsFromList(SpeciesList, {
                labels: SpeciesLabels,
                defaultLabel: 'Sélectionner une espèce',
                withSort: true
              })}
              onChange={(e) => setSpecies(e.target.value as Species)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['species']}
              whenValid="Expèce animale correctement renseigné."
              data-testid="species-select"
              label="Espèce animale"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSearchInput
              value={matrixKind ?? ''}
              options={selectOptionsFromList(
                MatrixKindList.filter((matrixKind) =>
                  prescriptions?.find((p) => p.matrixKind === matrixKind)
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
                StageList.filter(
                  (stage) =>
                    !prescriptions ||
                    prescriptions.find(
                      (p) =>
                        p.matrixKind === matrixKind && p.stages.includes(stage)
                    )
                ),
                {
                  labels: StageLabels,
                  defaultLabel: 'Sélectionner un stade'
                }
              )}
              onChange={(e) => setStage(e.target.value as Stage)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['stage']}
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement"
              required
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

export default MatrixStepPFAS;

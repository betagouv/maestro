import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  AnimalKind,
  AnimalKindLabels,
  AnimalKindsByProgrammingPlanKind
} from 'maestro-shared/referential/AnimalKind';
import {
  AnimalSex,
  AnimalSexLabels,
  AnimalSexList
} from 'maestro-shared/referential/AnimalSex';
import {
  BreedingMethod,
  BreedingMethodLabels,
  BreedingMethodList
} from 'maestro-shared/referential/BreedingMethod';
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList
} from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  OutdoorAccess,
  OutdoorAccessLabels,
  OutdoorAccessList
} from 'maestro-shared/referential/OutdoorAccess';
import {
  ProductionKind,
  ProductionKindLabels,
  ProductionKindsByProgrammingPlanKind
} from 'maestro-shared/referential/ProductionKind';
import {
  Seizure,
  SeizureLabels,
  SeizureList
} from 'maestro-shared/referential/Seizure';
import {
  Species,
  SpeciesByProgrammingPlanKind,
  SpeciesLabels
} from 'maestro-shared/referential/Species';
import {
  Stage,
  StageLabels,
  StageList
} from 'maestro-shared/referential/Stage';
import {
  TargetingCriteria,
  TargetingCriteriaLabels,
  TargetingCriteriaList
} from 'maestro-shared/referential/TargetingCriteria';
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
  specificData: z.discriminatedUnion('programmingPlanKind', [
    SampleMatrixSpecificDataPFASEggs,
    SampleMatrixSpecificDataPFASMeat
  ])
});

type SampleMatrixPFASData = z.infer<typeof SampleMatrixPFASData>;

export type PartialSamplePFAS = (PartialSample | PartialSampleToCreate) & {
  specificData: Extract<
    PartialSampleMatrixSpecificData,
    { programmingPlanKind: 'PFAS_EGGS' | 'PFAS_MEAT' }
  >;
};

export interface Props {
  partialSample: PartialSamplePFAS;
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
    const [stage, setStage] = useState(partialSample.stage);
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
      partialSample.specificData.programmingPlanKind === 'PFAS_MEAT'
        ? partialSample.specificData.productionKind
        : undefined
    );
    const [animalIdentifier, setAnimalIdentifier] = useState(
      partialSample.specificData.animalIdentifier
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

    type FormShape = typeof SampleMatrixPFASData.shape;

    const specificData = useMemo(
      () => ({
        programmingPlanKind: partialSample.specificData.programmingPlanKind,
        species,
        killingCode,
        targetingCriteria,
        notesOnTargetingCriteria,
        animalKind,
        productionKind,
        animalIdentifier,
        breedingMethod,
        age,
        sex,
        seizure,
        outdoorAccess
      }),
      [
        partialSample.specificData.programmingPlanKind,
        species,
        killingCode,
        targetingCriteria,
        notesOnTargetingCriteria,
        animalKind,
        productionKind,
        animalIdentifier,
        breedingMethod,
        age,
        sex,
        seizure,
        outdoorAccess
      ]
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
      } as SampleMatrixPFASData);

    const form = useForm(
      SampleMatrixPFASData,
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
          await save();
          await onSubmit();
        });
      }
    }));

    return (
      <>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div
            className={cx(
              'fr-col-12',
              'fr-col-sm-6',
              'fr-col-offset-sm-6--right'
            )}
          >
            <AppSelect<FormShape>
              value={species ?? ''}
              options={selectOptionsFromList(
                SpeciesByProgrammingPlanKind[
                  partialSample.specificData.programmingPlanKind
                ] ?? [],
                {
                  labels: SpeciesLabels,
                  defaultLabel: 'Sélectionner une espèce',
                  withSort: true
                }
              )}
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
                StageList.filter(
                  (stage) =>
                    !prescriptions ||
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
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            {partialSample.specificData.programmingPlanKind === 'PFAS_MEAT' && (
              <AppTextAreaInput<FormShape>
                rows={1}
                defaultValue={killingCode ?? ''}
                onChange={(e) => setKillingCode(e.target.value)}
                inputForm={form}
                inputKey="specificData"
                inputPathFromKey={['killingCode']}
                whenValid="Code tuerie correctement renseigné."
                label="Code tuerie"
                required
              />
            )}
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={targetingCriteria ?? ''}
              options={selectOptionsFromList(TargetingCriteriaList, {
                labels: TargetingCriteriaLabels,
                defaultLabel: 'Sélectionner un critère de ciblage'
              })}
              onChange={(e) =>
                setTargetingCriteria(e.target.value as TargetingCriteria)
              }
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['targetingCriteria']}
              whenValid="Critère de ciblage correctement renseigné."
              data-testid="targeting-criteria-select"
              label="Critère de ciblage"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppTextAreaInput<FormShape>
              rows={1}
              defaultValue={notesOnTargetingCriteria ?? ''}
              onChange={(e) => setNotesOnTargetingCriteria(e.target.value)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['notesOnTargetingCriteria']}
              whenValid="Précisions correctement renseignées."
              label="Précisions critère de ciblage"
            />
          </div>
        </div>

        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-pb-0')}>
            <span className={cx('fr-text--md', 'fr-text--bold')}>Animal</span>
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={animalKind ?? ''}
              options={selectOptionsFromList(
                AnimalKindsByProgrammingPlanKind[
                  partialSample.specificData.programmingPlanKind
                ] ?? [],
                {
                  labels: AnimalKindLabels,
                  defaultLabel: "Sélectionner un type d'animal"
                }
              )}
              onChange={(e) => setAnimalKind(e.target.value as AnimalKind)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['animalKind']}
              whenValid="Type d'animal correctement renseigné."
              data-testid="animal-kind-select"
              label="Type d'animal"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            {partialSample.specificData.programmingPlanKind === 'PFAS_MEAT' && (
              <AppSelect<FormShape>
                value={productionKind ?? ''}
                options={selectOptionsFromList(
                  ProductionKindsByProgrammingPlanKind[
                    partialSample.specificData.programmingPlanKind
                  ] ?? [],
                  {
                    labels: ProductionKindLabels,
                    defaultLabel: 'Sélectionner un type de production'
                  }
                )}
                onChange={(e) =>
                  setProductionKind(e.target.value as ProductionKind)
                }
                inputForm={form}
                inputKey="specificData"
                inputPathFromKey={['productionKind']}
                whenValid="Type de production correctement renseigné."
                data-testid="production-kind-select"
                label="Type de production"
                required
              />
            )}
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppTextAreaInput<FormShape>
              rows={1}
              defaultValue={animalIdentifier}
              onChange={(e) => setAnimalIdentifier(e.target.value)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['animalIdentifier']}
              whenValid="Identifiant correctement renseigné."
              label="Identifiant du lot ou de l'animal"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={breedingMethod ?? ''}
              options={selectOptionsFromList(BreedingMethodList, {
                labels: BreedingMethodLabels,
                defaultLabel: 'Sélectionner un mode d’élevage'
              })}
              onChange={(e) =>
                setBreedingMethod(e.target.value as BreedingMethod)
              }
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['breedingMethod']}
              whenValid="Mode d'élevage correctement renseignée."
              data-testid="breeding-method-select"
              label="Mode d'élevage"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={age ?? ''}
              options={selectOptionsFromList(
                Array.from({ length: 24 }, (_, i) => i + 1).map(
                  (i) => `${i} mois`
                ),
                {
                  defaultLabel: 'Sélectionner un age'
                }
              )}
              onChange={(e) => setAge(e.target.value)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['age']}
              whenValid="Âge correctement renseigné."
              data-testid="age-select"
              label="Âge"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={sex ?? ''}
              options={selectOptionsFromList(AnimalSexList, {
                labels: AnimalSexLabels,
                defaultLabel: 'Sélectionner un sexe'
              })}
              onChange={(e) => setSex(e.target.value as AnimalSex)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['sex']}
              whenValid="Sexe correctement renseigné."
              data-testid="sex-select"
              label="Sexe"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={seizure ?? ''}
              options={selectOptionsFromList(SeizureList, {
                labels: SeizureLabels,
                defaultLabel: 'Sélectionner une saisie'
              })}
              onChange={(e) => setSeizure(e.target.value as Seizure)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['seizure']}
              whenValid="Saisie correctement renseignée."
              data-testid="seizure-select"
              label="Saisie"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={outdoorAccess ?? ''}
              options={selectOptionsFromList(OutdoorAccessList, {
                labels: OutdoorAccessLabels,
                defaultLabel: "Sélectionner un accès à l'extérieur"
              })}
              onChange={(e) =>
                setOutdoorAccess(e.target.value as OutdoorAccess)
              }
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['outdoorAccess']}
              whenValid="Accès extérieur correctement renseigné."
              data-testid="outdoor-access-select"
              label="Accès à l'extérieur des animaux de l'élevage"
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

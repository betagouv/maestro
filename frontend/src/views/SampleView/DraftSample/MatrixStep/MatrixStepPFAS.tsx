import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  AnimalKind,
  AnimalKindAgeLimit,
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
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
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
import { Stage } from 'maestro-shared/referential/Stage';
import {
  TargetingCriteria,
  TargetingCriteriaLabels,
  TargetingCriteriaList
} from 'maestro-shared/referential/TargetingCriteria';
import {
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  prescriptionSubstancesCheck,
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
import {
  AppSelectOption,
  selectOptionsFromList
} from 'src/components/_app/AppSelect/AppSelectOption';
import { z } from 'zod/v4';
import AppRadioButtons from '../../../../components/_app/AppRadioButtons/AppRadioButtons';
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../../hooks/useForm';
import { MatrixStepRef } from './MatrixStep';

const SampleMatrixPFASData = SampleMatrixData.omit({
  documentIds: true,
  laboratoryId: true,
  monoSubstances: true,
  multiSubstances: true
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

type Props = {
  partialSample: PartialSamplePFAS;
  matrixKindOptions: AppSelectOption[];
  stageOptions: AppSelectOption[];
  onSave: (sampleMatrixData: SampleMatrixPFASData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
};

const MatrixStepPFAS = forwardRef<MatrixStepRef, Props>(
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

    const FormRefinement = SampleMatrixPFASData.check((ctx) => {
      const val = ctx.value;
      const ageLimit = AnimalKindAgeLimit[val.specificData.animalKind];
      if (
        (ageLimit?.min && val.specificData.age < ageLimit.min) ||
        (ageLimit?.max && val.specificData.age > ageLimit.max)
      ) {
        ctx.issues.push({
          code: 'custom',
          message: `Cet âge n'est pas autorisé pour le type d'animal sélectionné.`,
          path: ['specificData', 'age'],
          input: val
        });
      }
      prescriptionSubstancesCheck(ctx);
    });

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
        notesOnMatrix
      } as SampleMatrixPFASData);

    const form = useForm(
      FormRefinement,
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
            <AppSelect
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
              options={matrixKindOptions}
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
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            {partialSample.specificData.programmingPlanKind === 'PFAS_MEAT' && (
              <AppTextAreaInput
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
            <AppSelect
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
            <AppTextAreaInput
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
            <AppSelect
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
              <AppSelect
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
            <AppTextAreaInput
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
            <AppSelect
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
            <AppTextInput
              type="number"
              defaultValue={age ?? ''}
              onChange={(e) => setAge(Number(e.target.value))}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['age']}
              whenValid="Âge correctement renseigné."
              data-testid="age-input"
              label="Âge (en mois)"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect
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
            <AppSelect
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
            <AppRadioButtons
              legend="Accès à l'extérieur des animaux de l'élevage"
              options={
                selectOptionsFromList(OutdoorAccessList, {
                  labels: OutdoorAccessLabels,
                  withDefault: false
                }).map(({ label, value }) => ({
                  key: `outdoorAccess-option-${value}`,
                  label,
                  nativeInputProps: {
                    checked: outdoorAccess === value,
                    onChange: () => setOutdoorAccess(value as OutdoorAccess)
                  }
                })) ?? []
              }
              colSm={4}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['outdoorAccess']}
              required
              data-testid={`outdoor-access-radio`}
            />
          </div>
        </div>

        {renderSampleAttachments?.()}
        <hr />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput
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

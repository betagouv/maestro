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
import { Matrix } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixKind } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'maestro-shared/referential/Matrix/MatrixListByKind';
import {
  ProductionKind,
  ProductionKindLabels,
  ProductionKindsByProgrammingPlanKind
} from 'maestro-shared/referential/ProductionKind';
import {
  Species,
  SpeciesByProgrammingPlanKind,
  SpeciesLabels
} from 'maestro-shared/referential/Species';
import { Stage } from 'maestro-shared/referential/Stage';
import {
  PartialSample,
  PartialSampleMatrixSpecificData,
  PartialSampleToCreate,
  SampleMatrixData,
  SampleMatrixSpecificDataDAOABreeding,
  SampleMatrixSpecificDataDAOASlaughter
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
import AppSearchInput from '../../../../components/_app/AppSearchInput/AppSearchInput';
import AppTextAreaInput from '../../../../components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from '../../../../components/_app/AppTextInput/AppTextInput';
import { useForm } from '../../../../hooks/useForm';
import { MatrixStepRef } from './MatrixStep';

const SampleMatrixDAOAData = SampleMatrixData.omit({
  documentIds: true,
  laboratoryId: true,
  monoSubstances: true,
  multiSubstances: true
}).extend({
  specificData: z.discriminatedUnion('programmingPlanKind', [
    SampleMatrixSpecificDataDAOABreeding,
    SampleMatrixSpecificDataDAOASlaughter
  ])
});

type SampleMatrixDAOAData = z.infer<typeof SampleMatrixDAOAData>;

export type PartialSampleDAOA = (PartialSample | PartialSampleToCreate) & {
  specificData: Extract<
    PartialSampleMatrixSpecificData,
    { programmingPlanKind: 'DAOA_BREEDING' | 'DAOA_SLAUGHTER' }
  >;
};

type Props = {
  partialSample: PartialSampleDAOA;
  matrixKindOptions: AppSelectOption[];
  stageOptions: AppSelectOption[];
  onSave: (sampleMatrixData: SampleMatrixDAOAData) => Promise<void>;
  onSubmit: () => Promise<void>;
  renderSampleAttachments?: () => ReactNode;
};

const MatrixStepDAOA = forwardRef<MatrixStepRef, Props>(
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

    const [species, setSpecies] = useState(
      partialSample.specificData.programmingPlanKind === 'DAOA_BREEDING'
        ? partialSample.specificData.species
        : undefined
    );

    const [killingCode, setKillingCode] = useState(
      partialSample.specificData.killingCode
    );

    const [animalKind, setAnimalKind] = useState(
      partialSample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER'
        ? partialSample.specificData.animalKind
        : undefined
    );
    const [productionKind, setProductionKind] = useState(
      partialSample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER'
        ? partialSample.specificData.productionKind
        : undefined
    );
    const [animalIdentifier, setAnimalIdentifier] = useState(
      partialSample.specificData.animalIdentifier
    );
    const [age, setAge] = useState(
      partialSample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER'
        ? partialSample.specificData.age
        : undefined
    );
    const [sex, setSex] = useState(
      partialSample.specificData.programmingPlanKind === 'DAOA_SLAUGHTER'
        ? partialSample.specificData.sex
        : undefined
    );

    const specificData = useMemo(
      () => ({
        programmingPlanKind: partialSample.specificData.programmingPlanKind,
        species,
        killingCode,
        animalKind,
        productionKind,
        animalIdentifier,
        age,
        sex
      }),
      [
        partialSample.specificData.programmingPlanKind,
        species,
        killingCode,
        animalKind,
        productionKind,
        animalIdentifier,
        age,
        sex
      ]
    );

    const save = async () =>
      onSave({
        matrixKind,
        matrix,
        stage,
        specificData,
        notesOnMatrix
      } as SampleMatrixDAOAData);

    const form = useForm(
      SampleMatrixDAOAData,
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
          {partialSample.specificData.programmingPlanKind ===
            'DAOA_BREEDING' && (
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
          )}
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
            <AppTextInput
              defaultValue={killingCode ?? ''}
              onChange={(e) => setKillingCode(e.target.value)}
              inputForm={form}
              inputKey="specificData"
              inputPathFromKey={['killingCode']}
              whenValid="Code tuerie correctement renseigné."
              label="Code tuerie"
              required
            />
          </div>
        </div>

        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-pb-0')}>
            <span className={cx('fr-text--md', 'fr-text--bold')}>Animal</span>
          </div>
          {partialSample.specificData.programmingPlanKind ===
            'DAOA_SLAUGHTER' && (
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
          )}
          {partialSample.specificData.programmingPlanKind ===
            'DAOA_SLAUGHTER' && (
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
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
            </div>
          )}
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppTextInput
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
          {partialSample.specificData.programmingPlanKind ===
            'DAOA_SLAUGHTER' && (
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
          )}
          {partialSample.specificData.programmingPlanKind ===
            'DAOA_SLAUGHTER' && (
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

export default MatrixStepDAOA;

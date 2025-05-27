import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { AnimalKindLabels } from 'maestro-shared/referential/AnimalKind';
import { AnimalSexLabels } from 'maestro-shared/referential/AnimalSex';
import { BreedingMethodLabels } from 'maestro-shared/referential/BreedingMethod';
import { CultureKindLabels } from 'maestro-shared/referential/CultureKind';
import { getLaboratoryFullname } from 'maestro-shared/referential/Laboratory';
import { MatrixKindLabels } from 'maestro-shared/referential/Matrix/MatrixKind';
import { MatrixPartLabels } from 'maestro-shared/referential/Matrix/MatrixPart';
import { OutdoorAccessLabels } from 'maestro-shared/referential/OutdoorAccess';
import { ProductionKindLabels } from 'maestro-shared/referential/ProductionKind';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { SeizureLabels } from 'maestro-shared/referential/Seizure';
import { SpeciesLabels } from 'maestro-shared/referential/Species';
import { StageLabels } from 'maestro-shared/referential/Stage';
import { TargetingCriteriaLabels } from 'maestro-shared/referential/TargetingCriteria';
import {
  getSampleMatrixLabel,
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';

import { usePartialSample } from 'src/hooks/usePartialSample';
import { pluralize, quote } from 'src/utils/stringUtils';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';
import SampleDocument from '../../../components/SampleDocument/SampleDocument';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  showLabel?: boolean;
}
const MatrixStepSummary = ({ sample, showLabel }: Props) => {
  const { laboratory } = usePartialSample(sample);

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          La matrice contrôlée
        </Badge>
      }
      showLabel={showLabel}
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-restaurant-line')}></div>
        <div>
          {(sample.specificData.programmingPlanKind === 'PFAS_EGGS' ||
            sample.specificData.programmingPlanKind === 'PFAS_MEAT') && (
            <div>
              Espèce animale :{' '}
              <b>{SpeciesLabels[sample.specificData.species]}</b>
            </div>
          )}
          <div>
            Catégorie de matrice programmée :{' '}
            <b>{MatrixKindLabels[sample.matrixKind]}</b>
          </div>
          <div>
            Matrice : <b>{getSampleMatrixLabel(sample)}</b>
          </div>
          {sample.specificData.programmingPlanKind === 'PPV' && (
            <>
              <div>
                LMR/ Partie du végétal concernée :{' '}
                <b>{MatrixPartLabels[sample.specificData.matrixPart]}</b>
              </div>
              <div>
                Détails de la matrice :{' '}
                <b>{sample.specificData.matrixDetails}</b>
              </div>
            </>
          )}

          {(sample.specificData.programmingPlanKind === 'PFAS_EGGS' ||
            sample.specificData.programmingPlanKind === 'PFAS_MEAT') && (
            <>
              <div>
                Critère de ciblage :{' '}
                <b>
                  {
                    TargetingCriteriaLabels[
                      sample.specificData.targetingCriteria
                    ]
                  }
                </b>
              </div>
              <div>
                Précisions critère de ciblage :{' '}
                <b>{sample.specificData.notesOnTargetingCriteria}</b>
              </div>
            </>
          )}
        </div>
      </div>

      {sample.specificData.programmingPlanKind === 'PPV' &&
        sample.specificData.cultureKind && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-seedling-line')}></div>
            <div>
              Type de culture :{' '}
              <b>{CultureKindLabels[sample.specificData.cultureKind]}</b>
            </div>
          </div>
        )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-sip-line')}></div>
        <div>
          Stade de prélèvement : <b>{StageLabels[sample.stage]}</b>
        </div>
      </div>

      {(sample.specificData.programmingPlanKind === 'PFAS_EGGS' ||
        sample.specificData.programmingPlanKind === 'PFAS_MEAT') && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-bug-line')}></div>
          <div>
            <div>
              Type d'animal :{' '}
              <b>{AnimalKindLabels[sample.specificData.animalKind]}</b>
            </div>
            {sample.specificData.programmingPlanKind === 'PFAS_MEAT' && (
              <div>
                Type de production :{' '}
                <b>
                  {ProductionKindLabels[sample.specificData.productionKind]}
                </b>
              </div>
            )}
            <div>
              Identifiant du lot ou de l'animal :{' '}
              <b>{sample.specificData.animalIdentifier}</b>
            </div>
            <div>
              Mode d'élevage :{' '}
              <b>{BreedingMethodLabels[sample.specificData.breedingMethod]}</b>
            </div>
            <div>
              Âge (en mois) : <b>{sample.specificData.age}</b>
            </div>
            <div>
              Sexe : <b>{AnimalSexLabels[sample.specificData.sex]}</b>
            </div>
            {sample.specificData.seizure && (
              <div>
                Saisie : <b>{SeizureLabels[sample.specificData.seizure]}</b>
              </div>
            )}
            <div>
              Accès à l'extérieur des animaux de l'élevage :{' '}
              <b>{OutdoorAccessLabels[sample.specificData.outdoorAccess]}</b>
            </div>
          </div>
        </div>
      )}
      {sample.specificData.programmingPlanKind === 'PPV' &&
        sample.specificData.releaseControl && (
          <div className="summary-item icon-text">
            <div className={cx('fr-icon-checkbox-circle-line')}></div>
            <div>
              <b>Contrôle libératoire</b>
            </div>
          </div>
        )}
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-mental-health-line')}></div>
        <div>
          Laboratoire destinataire :{' '}
          {laboratory ? (
            <b>{getLaboratoryFullname(laboratory.name)}</b>
          ) : (
            <span className="missing-data">Information non disponible</span>
          )}
        </div>
      </div>
      {sample.specificData.programmingPlanKind === 'PPV' && (
        <>
          {!sample.monoSubstances?.length &&
            !sample.multiSubstances?.length && (
              <div className="summary-item icon-text">
                <div className={cx('fr-icon-list-ordered')}></div>
                <div className="missing-data">
                  Méthode d'analyse non disponible
                </div>
              </div>
            )}
          {sample.monoSubstances && sample.monoSubstances.length > 0 && (
            <div className="summary-item icon-text">
              <div className={cx('fr-icon-list-ordered')}></div>
              <div>
                {pluralize(sample.monoSubstances.length)('Analyse')}{' '}
                mono-résidu :{' '}
                <ul>
                  {sample.monoSubstances.map((substance) => (
                    <li key={`Mono_${substance}`}>{SSD2IdLabel[substance]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {sample.multiSubstances && sample.multiSubstances.length > 0 && (
            <div className="summary-item icon-text">
              <div className={cx('fr-icon-list-ordered')}></div>
              <div>
                Analyses multi-résidus dont :{' '}
                <ul>
                  {sample.multiSubstances.map((substance) => (
                    <li key={`Multi_${substance}`}>{SSD2IdLabel[substance]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
      {sample.documentIds?.map((documentId) => (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-attachment-line')}></div>
          <div className={cx('fr-col')}>
            Pièces jointes :{' '}
            <div className={cx('fr-mt-2w')}>
              <SampleDocument
                key={documentId}
                documentId={documentId}
                readonly
              />
            </div>
          </div>
        </div>
      ))}
      {sample.notesOnMatrix && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>{quote(sample.notesOnMatrix)}</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default MatrixStepSummary;

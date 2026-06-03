import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { capitalize, isNil } from 'lodash-es';
import { OptionalBooleanLabels } from 'maestro-shared/referential/OptionnalBoolean';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { ContaminationSourceLabels } from 'maestro-shared/schema/Analysis/Residue/ContaminationSource';
import {
  LmrIsValid,
  type PartialResidue,
  type ResidueLmrChecked
} from 'maestro-shared/schema/Analysis/Residue/Residue';
import { ResidueComplianceLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import {
  type ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import type { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import ResidueResultAlert from '../../../../components/ResidueResultAlert/ResidueResultAlert';
import { pluralize, quote } from '../../../../utils/stringUtils';
import {
  ResidueComplianceColor,
  ResidueComplianceIcon
} from './ResidueComplianceIcon';
import './ResidueResultOverview.scss';

type Props = {
  programmingSubPlanCodeNat: string;
  residue: Omit<PartialResidue, 'kind'>;
};
export const ResidueResultOverview: FunctionComponent<Props> = ({
  programmingSubPlanCodeNat,
  residue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const hasLmr = !isNil(residue.lmr) && residue.lmr !== 0;

  return (
    <div className={clsx('residue-detail-container')}>
      <ResidueHeader residue={residue} residueIndex={1} />
      <hr />
      <div className={clsx('result-detail-bloc')}>
        <div className="result-header">
          <span className={cx('fr-text--lg', 'fr-text--heavy', 'fr-m-0')}>
            Analyse
          </span>
          <Tag small={true} className={cx()}>
            {residue.analysisMethod
              ? capitalize(AnalysisMethodLabels[residue.analysisMethod])
              : ''}
          </Tag>
        </div>

        <ResidueValueLabel
          programmingSubPlanCodeNat={programmingSubPlanCodeNat}
          residue={residue}
        />
        {residue.analytes?.length && (
          <span
            className={cx(
              'fr-text--md',
              'fr-text--heavy',
              'fr-m-0',
              'fr-mt-2w'
            )}
          >
            Analytes
          </span>
        )}
        {residue.analytes?.map((analyte, analyteIndex) => (
          <div key={`analyte-${analyteIndex}`}>
            <div
              className={clsx(
                cx('fr-text--md', 'fr-m-0'),
                'd-flex-align-center'
              )}
            >
              <span>
                {analyte.reference ? SSD2IdLabel[analyte.reference] : ''}
              </span>
              <div className="fr-ml-auto"></div>
              {analyte.resultKind === 'Q' ? (
                <>{analyte.result} mg/kg</>
              ) : (
                <>Détecté, non quantifié</>
              )}
            </div>
          </div>
        ))}
      </div>
      <hr />

      <div className="result-detail-bloc">
        <h6 className={cx('fr-m-0')}>Interprétation du résultat</h6>
        {hasLmr && (
          <div className={'result-with-comment'}>
            <div className="d-flex-align-center">
              Résultat brut entrainant un dépassement de l'Arfd ?
              <b className={'fr-ml-auto'}>
                {residue.resultHigherThanArfd
                  ? OptionalBooleanLabels[residue.resultHigherThanArfd]
                  : 'Non renseigné'}
              </b>
            </div>
            {residue.notesOnResult && <i>{quote(residue.notesOnResult)}</i>}

            {residue.resultHigherThanArfd === 'true' && (
              <Alert
                severity="warning"
                className={cx('fr-mt-2w')}
                small
                description="Alerte risque consommateur"
              />
            )}
          </div>
        )}

        {programmingSubPlanCodeNat === 'PPV' && (
          <>
            <div className="d-flex-align-center">
              Substance approuvée dans l'UE
              <b className={'fr-ml-auto'}>
                {residue.substanceApproved
                  ? OptionalBooleanLabels[residue.substanceApproved]
                  : 'Non renseigné'}
              </b>
            </div>
            <div className="d-flex-align-center">
              Substance autorisée pour l'usage
              <b className={'fr-ml-auto'}>
                {residue.substanceAuthorised
                  ? OptionalBooleanLabels[residue.substanceAuthorised]
                  : 'Non renseigné'}
              </b>
            </div>
            {residue.pollutionRisk && (
              <div className={'result-with-comment'}>
                <div className="d-flex-align-center">
                  Pollution environnementale probable
                  <b className={'fr-ml-auto'}>
                    {OptionalBooleanLabels[residue.pollutionRisk]}
                  </b>
                </div>
                {residue.notesOnPollutionRisk && (
                  <i>{quote(residue.notesOnPollutionRisk)}</i>
                )}
              </div>
            )}
            {residue.contaminationSources &&
              residue.contaminationSources.length > 0 && (
                <div>
                  <div className={cx('fr-mb-1w')}>
                    {pluralize(residue.contaminationSources.length)('Source')}{' '}
                    de contamination
                  </div>
                  <div>
                    {residue.contaminationSources.map((source) => (
                      <Tag
                        key={source}
                        small={true}
                        className={cx('fr-mr-1w', 'fr-mb-1w')}
                      >
                        {ContaminationSourceLabels[source]}
                      </Tag>
                    ))}
                  </div>
                  {residue.notesOnContaminationSources && (
                    <i>{quote(residue.notesOnContaminationSources)}</i>
                  )}
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

const ResidueValueLabel = ({
  programmingSubPlanCodeNat,
  residue
}: Pick<Props, 'residue' | 'programmingSubPlanCodeNat'>) => {
  const lmrIsOptional = LmrIsValid({
    ...(residue as ResidueLmrChecked),
    matrixPart: (residue as ResidueLmrChecked).specificData?.matrixPart as
      | string
      | undefined,
    lmr: null
  });

  const hideLmr = lmrIsOptional && !residue.lmr;
  return (
    <>
      {residue.resultKind === 'Q' && (
        <>
          <div className="d-flex-align-center">
            Valeur du résultat
            <b className={'fr-ml-auto'}>{residue.result} mg/kg</b>
          </div>
          {!hideLmr && (
            <div className="d-flex-align-center">
              Valeur de la LMR
              <b className={'fr-ml-auto'}>{residue.lmr} mg/kg</b>
            </div>
          )}
          <ResidueResultAlert
            programmingSubPlanCodeNat={programmingSubPlanCodeNat}
            result={residue.result}
            lmr={residue.lmr}
            lmrIsOptional={lmrIsOptional}
          />
        </>
      )}
      {residue.resultKind === 'NQ' && (
        <div className="d-flex-align-center">
          Valeur du résultat
          <b className={clsx('fr-ml-auto', 'align-right')}>
            Détecté, non quantifié
          </b>
        </div>
      )}
    </>
  );
};

export const ResidueHeader = ({
  residue,
  residueIndex
}: Pick<Props, 'residue'> & { residueIndex: number }) => {
  const kind: ResidueKind =
    residue.reference !== undefined && isComplex(residue.reference)
      ? 'Complex'
      : 'Simple';
  return (
    <div>
      {residue.compliance && (
        <div className={'d-flex-align-center'}>
          <ResidueComplianceIcon
            compliance={residue.compliance}
            className={['fr-pr-1v']}
          />
          <span
            className={clsx(
              ResidueComplianceColor[residue.compliance],
              cx('fr-text--sm', 'fr-m-0', 'fr-text--heavy')
            )}
          >
            {ResidueComplianceLabels[residue.compliance]}
          </span>
        </div>
      )}
      <span>
        {residue.otherCompliance && (
          <div className={cx('fr-text--xs', 'fr-m-0')}>
            {quote(residue.otherCompliance)}
          </div>
        )}
      </span>
      <h6 className={clsx('d-flex-align-center', cx('fr-m-0'))}>
        {residue.reference
          ? SSD2IdLabel[residue.reference]
          : `Résidu n°${residueIndex + 1}`}
      </h6>
      {residue.reference ? (
        <Badge noIcon severity="info" small={true} className={cx('fr-mt-1w')}>
          {ResidueKindLabels[kind]}
        </Badge>
      ) : null}
    </div>
  );
};

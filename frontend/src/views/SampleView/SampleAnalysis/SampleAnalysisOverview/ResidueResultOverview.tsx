import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { OptionalBooleanLabels } from 'maestro-shared/referential/OptionnalBoolean';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { ResidueComplianceLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueCompliance';
import {
  ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import ResidueResultAlert from '../../../../components/ResidueResultAlert/ResidueResultAlert';
import { quote } from '../../../../utils/stringUtils';
import {
  ResidueComplianceColor,
  ResidueComplianceIcon
} from './ResidueComplianceIcon';
import './ResidueResultOverview.scss';

type Props = {
  residue: Omit<PartialResidue, 'kind'>;
};
export const ResidueResultOverview: FunctionComponent<Props> = ({
  residue,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const kind: ResidueKind =
    residue.reference !== undefined && isComplex(residue.reference)
      ? 'Complex'
      : 'Simple';
  return (
    <div className={clsx('residue-detail-container')}>
      <div>
        <h6 className={clsx('d-flex-align-center', cx('fr-m-0'))}>
          <span>Résidu n°{residue.residueNumber}</span>
          <Tag className={cx('fr-ml-1w', 'fr-text--regular')}>
            {ResidueKindLabels[kind]}
          </Tag>
        </h6>
        {residue.compliance && (
          <div className={'d-flex-align-center'}>
            <ResidueComplianceIcon
              compliance={residue.compliance}
              className={['fr-pr-1v']}
            />
            <span
              className={clsx(
                ResidueComplianceColor[residue.compliance],
                cx('fr-text--xs', 'fr-m-0')
              )}
            >
              {ResidueComplianceLabels[residue.compliance]}
            </span>
          </div>
        )}
        <span>
          {residue.otherCompliance && (
            <div className={cx('fr-text--sm', 'fr-m-0')}>
              {quote(residue.otherCompliance)}
            </div>
          )}
        </span>
      </div>
      <hr className={cx('fr-my-3w')} />
      <div className="result-container">
        <div className="overview-header">
          <Badge noIcon severity="info" className={cx()}>
            {residue.analysisMethod
              ? AnalysisMethodLabels[residue.analysisMethod]
              : ''}
          </Badge>
        </div>
        <div className={clsx('overview-content')}>
          {kind === 'Simple' ? (
            <ResidueValueLabel residue={residue} />
          ) : (
            <>
              <span className={cx('fr-text--bold')}>
                {residue.reference !== undefined
                  ? SSD2IdLabel[residue.reference]
                  : ''}
              </span>
              <hr />
              {residue.analytes?.map((analyte, analyteIndex) => (
                <div key={`analyte-${analyteIndex}`}>
                  <div
                    className={clsx(
                      cx('fr-text--lg', 'fr-m-0'),
                      'd-flex-align-center'
                    )}
                  >
                    <span>
                      {analyte.reference ? SSD2IdLabel[analyte.reference] : ''}
                    </span>
                    <div className="margin-left-auto"></div>
                    {analyte.resultKind === 'Q' ? (
                      <b>{analyte.result} mg/kg</b>
                    ) : (
                      <b>Détecté, non quantifié</b>
                    )}
                  </div>
                </div>
              ))}
              <hr />
              <h6 className={cx('fr-mb-0')}>Somme des analytes</h6>
              <ResidueValueLabel residue={residue} />
            </>
          )}
        </div>
      </div>
      <hr className={cx('fr-my-3w')} />

      <div className={clsx('result-container')}>
        <div className="overview-header">
          <h6>Interprétation du résultat</h6>
        </div>
        <div className="overview-content">
          <div className="d-flex-align-center">
            Résultat brut supérieur à l'Arfd ?
            <b className={'margin-left-auto'}>
              {residue.resultHigherThanArfd
                ? OptionalBooleanLabels[residue.resultHigherThanArfd]
                : 'Non renseigné'}
            </b>
          </div>
          {residue.notesOnResult && <i>{quote(residue.notesOnResult)}</i>}
          <div className="d-flex-align-center">
            Substance approuvée dans l'UE
            <b className={'margin-left-auto'}>
              {residue.substanceApproved
                ? OptionalBooleanLabels[residue.substanceApproved]
                : 'Non renseigné'}
            </b>
          </div>
          <div className="d-flex-align-center">
            Substance autorisée pour l'usage
            <b className={'margin-left-auto'}>
              {residue.substanceAuthorised
                ? OptionalBooleanLabels[residue.substanceAuthorised]
                : 'Non renseigné'}
            </b>
          </div>
          {residue.pollutionRisk && (
            <>
              <div className="d-flex-align-center">
                Pollution environnementale probable
                <b className={'margin-left-auto'}>
                  {OptionalBooleanLabels[residue.pollutionRisk]}
                </b>
              </div>
              {residue.pollutionRisk === 'true' && (
                <Alert
                  severity="warning"
                  small
                  description="Alerte risque consommateur"
                />
              )}
            </>
          )}
          {residue.notesOnPollutionRisk && (
            <i>{quote(residue.notesOnPollutionRisk)}</i>
          )}
        </div>
      </div>
    </div>
  );
};

const ResidueValueLabel = ({ residue }: Pick<Props, 'residue'>) => {
  return (
    <>
      {residue.resultKind === 'Q' && (
        <>
          <span className={cx('fr-text--bold')}>
            {residue.reference !== undefined
              ? SSD2IdLabel[residue.reference]
              : ''}
          </span>
          <div className="d-flex-align-center">
            Valeur du résultat
            <b className={'margin-left-auto'}>{residue.result} mg/kg</b>
          </div>
          <div className="d-flex-align-center">
            Valeur de la LMR
            <b className={'margin-left-auto'}>{residue.lmr} mg/kg</b>
          </div>
          <ResidueResultAlert result={residue.result} lmr={residue.lmr} />
        </>
      )}
      {residue.resultKind === 'NQ' && (
        <>
          <div className="d-flex-align-center">
            {residue.reference !== undefined
              ? SSD2IdLabel[residue.reference]
              : ''}
            <b className={clsx('margin-left-auto', 'align-right')}>
              Détecté, non quantifié
            </b>
          </div>
        </>
      )}
    </>
  );
};

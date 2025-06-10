import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResidueKind,
  ResidueKindLabels
} from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import ResidueResultAlert from '../../../../components/ResidueResultAlert/ResidueResultAlert';

type Props = {
  residueIndex: number;
  residue: Omit<PartialResidue, 'kind'>;
  children?: JSX.Element;
};
export const ResidueResultOverview: FunctionComponent<Props> = ({
  residueIndex,
  residue,
  children,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const kind: ResidueKind =
    residue.reference !== undefined && isComplex(residue.reference)
      ? 'Complex'
      : 'Simple';
  return (
    <div>
      <h6 className={clsx(cx('fr-mb-2w'), 'd-flex-align-center')}>
        <span
          className={clsx(
            cx('fr-icon-microscope-line', 'fr-mr-1w'),
            'icon-grey'
          )}
        ></span>
        <span>Résidu n°{residueIndex + 1}</span>
        <Tag className={cx('fr-ml-1w', 'fr-text--regular')}>
          {ResidueKindLabels[kind]}
        </Tag>
      </h6>
      <div className="overview-container">
        <div className="overview-header">
          <div className="bullet" />
          <Badge noIcon severity="info" className={cx('fr-ml-3w')}>
            Analyse{' '}
            {residue.analysisMethod
              ? AnalysisMethodLabels[residue.analysisMethod]
              : ''}
          </Badge>
        </div>
        <div className={clsx('overview-content', 'border-left')}>
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
                  <span className={cx('fr-text--bold', 'fr-mb-2w')}>
                    Analyte n°{analyteIndex + 1} du résidu complexe
                  </span>
                  <div
                    className={clsx(cx('fr-text--lg'), 'd-flex-align-center')}
                  >
                    <span>
                      {analyte.reference ? SSD2IdLabel[analyte.reference] : ''}
                    </span>
                    <div className="border-middle"></div>
                    {analyte.resultKind === 'Q' ? (
                      <b>{analyte.result} mg/kg</b>
                    ) : (
                      <b>Détecté, non quantifié</b>
                    )}
                  </div>
                </div>
              ))}
              <hr className={cx('fr-mt-2w')} />
              <h6 className={cx('fr-mb-0', 'fr-mt-2w')}>Somme des analytes</h6>
              <ResidueValueLabel residue={residue} />
            </>
          )}
        </div>
      </div>
      {children}
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
            <div className="border-middle"></div>
            <b>{residue.result} mg/kg</b>
          </div>
          <div className="d-flex-align-center">
            Valeur de la LMR
            <div className="border-middle"></div>
            <b>{residue.lmr} mg/kg</b>
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
            <div className="border-middle"></div>
            <b>Détecté, non quantifié</b>
          </div>
        </>
      )}
    </>
  );
};

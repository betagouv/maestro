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
      <div className={clsx(cx('fr-pl-4w'), 'step-summary')}>
        <div>
          Analyse{' '}
          <b>
            {residue.analysisMethod
              ? AnalysisMethodLabels[residue.analysisMethod]
              : ''}
          </b>
        </div>
        {kind === 'Simple' ? (
          <>
            {residue.resultKind === 'Q' && (
              <>
                {residue.reference !== undefined
                  ? SSD2IdLabel[residue.reference]
                  : ''}
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
        ) : (
          <>
            {residue.reference !== undefined
              ? SSD2IdLabel[residue.reference]
              : ''}
            {residue.analytes?.map((analyte, analyteIndex) => (
              <div key={`analyte-${analyteIndex}`}>
                <Badge severity="warning" noIcon className={cx('fr-mb-2w')}>
                  Analyte n°{analyteIndex + 1} du résidu complexe
                </Badge>
                <div className="d-flex-align-center">
                  {analyte.reference ? SSD2IdLabel[analyte.reference] : ''}
                  <div className="border-middle"></div>
                  {analyte.resultKind === 'Q' ? (
                    <b>{analyte.result} mg/kg</b>
                  ) : (
                    <b>Détecté, non quantifié</b>
                  )}
                </div>
              </div>
            ))}
            <h6 className={cx('fr-mb-0', 'fr-mt-2w')}>Somme des analytes</h6>
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
        {children}
      </div>
    </div>
  );
};

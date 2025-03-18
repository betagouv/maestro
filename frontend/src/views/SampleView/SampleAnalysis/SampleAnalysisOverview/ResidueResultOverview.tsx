import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { AnalyteLabels } from 'maestro-shared/referential/Residue/AnalyteLabels';
import { ComplexResidue } from 'maestro-shared/referential/Residue/ComplexResidue';
import { ComplexResidueLabels } from 'maestro-shared/referential/Residue/ComplexResidueLabels';
import { SimpleResidue } from 'maestro-shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from 'maestro-shared/referential/Residue/SimpleResidueLabels';
import { AnalysisMethodLabels } from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { ResidueKind, ResidueKindLabels } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import ResidueResultAlert from '../../../../components/ResidueResultAlert/ResidueResultAlert';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierachy';

export type Props = {
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

  const kind: ResidueKind = residue.reference !== undefined && isComplex(residue.reference) ? 'Complex' : 'Simple'
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
          Analyse <b>{residue.analysisMethod ? AnalysisMethodLabels[residue.analysisMethod] : ''}</b>
        </div>
        {kind === 'Simple' ? (
          <>
            {residue.resultKind === 'Q' && (
              <>
                {SimpleResidueLabels[residue.reference as SimpleResidue]}
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
                  {SimpleResidueLabels[residue.reference as SimpleResidue]}
                  <div className="border-middle"></div>
                  <b>Détecté, non quantifié</b>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {ComplexResidueLabels[residue.reference as ComplexResidue]}
            {residue.analytes?.map((analyte, analyteIndex) => (
              <div key={`analyte-${analyteIndex}`}>
                <Badge severity="warning" noIcon className={cx('fr-mb-2w')}>
                  Analyte n°{analyteIndex + 1} du résidu complexe
                </Badge>
                <div className="d-flex-align-center">
                  {analyte.reference ? AnalyteLabels[analyte.reference] : ''}
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

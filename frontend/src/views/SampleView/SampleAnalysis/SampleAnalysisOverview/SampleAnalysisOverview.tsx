import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { type PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import check from '../../../../assets/illustrations/check.svg';
import close from '../../../../assets/illustrations/close.svg';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { quote } from '../../../../utils/stringUtils';
import { ResidueListResult } from './ResidueListResult';
import { ResidueResultOverview } from './ResidueResultOverview';
import { ResiduesSummary } from './ResiduesSummary';

type Props = {
  sample: Sample;
  analysis: PartialAnalysis;
};
export const SampleAnalysisOverview: FunctionComponent<Props> = ({
  sample,
  analysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { hasUserPermission, user } = useAuthentication();

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  const residues = analysis.residues;

  return (
    <>
      {analysis && (
        <>
          <div className={clsx('d-flex-align-center', cx('fr-m-0'))}>
            <ResiduesSummary residues={analysis.residues ?? []} />

            {!readonly && (
              <Button
                priority="primary"
                iconId="fr-icon-edit-line"
                className={cx('fr-mt-0', 'fr-ml-auto')}
                size="small"
                onClick={() => {
                  //FIXME
                  //setEditingStatus('Residues');
                  //editingConfirmationModal.open();
                }}
              >
                Corriger
              </Button>
            )}
          </div>

          {residues?.length && (
            <ResidueListResult
              residues={residues}
              residuePanel={(i) => (
                <ResidueResultOverview residue={residues[i]} />
              )}
            />
          )}

          <div
            className={clsx(
              cx('fr-callout'),
              analysis.compliance
                ? 'fr-callout--green-emeraude'
                : 'fr-callout--pink-tuile',
              'bg-white',
              'border',
              'border-bottom'
            )}
          >
            <h4 className="d-flex-align-center">
              <div className="flex-grow-1">
                Conformité globale de l'échantillon
              </div>
            </h4>
            <div>
              {analysis.compliance ? (
                <h5 className={clsx('d-flex-align-center', cx('fr-mb-0'))}>
                  <img src={check} alt="" className={cx('fr-mr-2w')} />
                  Échantillon conforme
                </h5>
              ) : (
                <h5 className={clsx('d-flex-align-center', cx('fr-mb-0'))}>
                  <img src={close} alt="" className={cx('fr-mr-2w')} />
                  Échantillon non conforme
                </h5>
              )}
              {analysis.notesOnCompliance && (
                <div className={cx('fr-pl-9w', 'fr-text--lead')}>
                  <div>Note additionnelle</div>
                  <i>{quote(analysis.notesOnCompliance)}</i>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

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
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueListResultOverview } from './ResidueListResultOverview';
import { ResiduesSummary } from './ResiduesSummary';
import './SampleAnalysisOverview.scss';

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

  return (
    <>
      {analysis && (
        <>
          <AnalysisDocumentPreview
            analysisId={analysis.id}
            sampleId={sample.id}
            readonly={true}
          />

          <div>
            <h5 className={clsx('d-flex-align-center', cx('fr-m-0'))}>
              <div className="flex-grow-1">
                <ResiduesSummary residues={analysis.residues ?? []} />
              </div>
              {!readonly && (
                <Button
                  priority="primary"
                  iconId="fr-icon-edit-line"
                  className={cx('fr-mt-0')}
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
            </h5>
          </div>

          {analysis.residues?.length && (
            <ResidueListResultOverview residues={analysis.residues} />
          )}

          <div>
            <h4 className="d-flex-align-center">
              <div className="flex-grow-1">
                Conformité globale de l'échantillon
              </div>
            </h4>
            <div>
              {analysis.compliance ? (
                <h6 className={cx('fr-mb-0')}>
                  <img src={check} alt="" className={cx('fr-mr-2w')} />
                  Échantillon conforme
                </h6>
              ) : (
                <h6 className={cx('fr-mb-0')}>
                  <img src={close} alt="" className={cx('fr-mr-2w')} />
                  Échantillon non conforme
                </h6>
              )}
              {analysis.notesOnCompliance && (
                <div className={cx('fr-pl-9w', 'fr-text--lead')}>
                  <div>Note additionnelle</div>
                  <b>{quote(analysis.notesOnCompliance)}</b>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

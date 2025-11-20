import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { t } from 'i18next';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useContext, useMemo } from 'react';
import { assert, type Equals } from 'tsafe';
import check from '../../../../assets/illustrations/check.svg';
import close from '../../../../assets/illustrations/close.svg';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../../services/apiClient';
import { pluralize, quote } from '../../../../utils/stringUtils';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueListResultOverview } from './ResidueListResultOverview';
import './SampleAnalysisOverview.scss';

type Props = {
  sample: Sample;
  analysis: Analysis;
};
export const SampleAnalysisOverview: FunctionComponent<Props> = ({
  sample,
  analysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);
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
            readonly={readonly}
            button={
              <Button
                priority="secondary"
                iconId="fr-icon-edit-line"
                className={cx('fr-mt-0')}
                size="small"
                onClick={() => {
                  //FIXME
                  // setEditingStatus('Report');
                  // editingConfirmationModal.open();
                }}
              >
                Corriger
              </Button>
            }
          />

          <div>
            <h5 className="d-flex-align-center">
              <div className="flex-grow-1">
                {t('residue', { count: analysis.residues?.length || 0 })}
                {pluralize(analysis.residues?.length || 0)(' identifié')}
              </div>
              {!readonly && (
                <Button
                  priority="secondary"
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
            <ResidueListResultOverview></ResidueListResultOverview>
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

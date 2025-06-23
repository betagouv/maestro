import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import clsx from 'clsx';
import { t } from 'i18next';
import { OptionalBooleanLabels } from 'maestro-shared/referential/OptionnalBoolean';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { useContext, useMemo, useState } from 'react';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import { pluralize, quote } from 'src/utils/stringUtils';
import check from '../../../../assets/illustrations/check.svg';
import close from '../../../../assets/illustrations/close.svg';
import { useAuthentication } from '../../../../hooks/useAuthentication';
import { ApiClientContext } from '../../../../services/apiClient';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueResultOverview } from './ResidueResultOverview';
import './SampleAnalysisOverview.scss';

interface Props {
  sample: Sample;
}

const SampleAnalysisOverview = ({ sample }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const { data } = apiClient.useGetSampleAnalysisQuery(sample.id);
  const { hasUserPermission, user } = useAuthentication();
  const analysis = data as Analysis | undefined;

  const [updateAnalysis] = apiClient.useUpdateAnalysisMutation();
  const [updateSample] = apiClient.useUpdateSampleMutation();

  const [editingStatus, setEditingStatus] = useState(
    analysis?.status ?? 'Report'
  );

  const editingConfirmationModal = useMemo(
    () =>
      createModal({
        id: `editing-confirmation-modal-${sample.id}`,
        isOpenedByDefault: false
      }),
    [sample.id]
  );

  const readonly = useMemo(
    () =>
      !hasUserPermission('createAnalysis') || sample.region !== user?.region,
    [hasUserPermission, sample, user?.region]
  );

  if (!analysis) {
    return <></>;
  }

  const editAnalysis = async () => {
    await updateSample({
      ...sample,
      status: 'Analysis'
    });
    await updateAnalysis({
      ...analysis,
      status: editingStatus
    });
  };

  return (
    <>
      <AnalysisDocumentPreview reportDocumentId={analysis.reportDocumentId}>
        {!readonly ? (
          <Button
            priority="secondary"
            iconId="fr-icon-edit-line"
            className={cx('fr-mt-0')}
            size="small"
            onClick={() => {
              setEditingStatus('Report');
              editingConfirmationModal.open();
            }}
          >
            Éditer
          </Button>
        ) : (
          <></>
        )}
      </AnalysisDocumentPreview>
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
                setEditingStatus('Residues');
                editingConfirmationModal.open();
              }}
            >
              Éditer
            </Button>
          )}
        </h5>
      </div>
      {analysis.residues?.map((residue, residueIndex) => (
        <div key={`residue-${residueIndex}`}>
          <ResidueResultOverview residueIndex={residueIndex} residue={residue}>
            <div className={clsx(cx('fr-mt-4w'), 'overview-container')}>
              <div className="overview-header">
                <div className="bullet" />
                <h6 className={cx('fr-ml-3w', 'fr-mb-0')}>
                  Interprétation du résultat
                </h6>
              </div>
              <div className="overview-content">
                <div className="d-flex-align-center">
                  Résultat brut supérieur à l'Arfd ?
                  <div className="border-middle"></div>
                  <b>
                    {residue.resultHigherThanArfd
                      ? OptionalBooleanLabels[residue.resultHigherThanArfd]
                      : 'Non renseigné'}
                  </b>
                </div>
                {residue.notesOnResult && (
                  <div className="analysis-note">
                    <i>{quote(residue.notesOnResult)}</i>
                  </div>
                )}
                <div className="d-flex-align-center">
                  Substance approuvée dans l'UE
                  <div className="border-middle"></div>
                  <b>
                    {residue.substanceApproved
                      ? OptionalBooleanLabels[residue.substanceApproved]
                      : 'Non renseigné'}
                  </b>
                </div>
                <div className="d-flex-align-center">
                  Substance autorisée pour l'usage
                  <div className="border-middle"></div>
                  <b>
                    {residue.substanceAuthorised
                      ? OptionalBooleanLabels[residue.substanceAuthorised]
                      : 'Non renseigné'}
                  </b>
                </div>
                {residue.pollutionRisk && (
                  <>
                    <div className="d-flex-align-center">
                      Pollution environnementale probable
                      <div className="border-middle"></div>
                      <b>{OptionalBooleanLabels[residue.pollutionRisk]}</b>
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
                  <div className="analysis-note">
                    <i>{quote(residue.notesOnPollutionRisk)}</i>
                  </div>
                )}
                {residue.compliance === 'Compliant' && (
                  <div>
                    <span
                      className={cx(
                        'fr-icon-check-line',
                        'fr-label--success',
                        'fr-mr-1w'
                      )}
                    />
                    <b>Conforme</b>
                  </div>
                )}
                {residue.compliance === 'NonCompliant' && (
                  <div>
                    <span
                      className={cx(
                        'fr-icon-close-line',
                        'fr-label--error',
                        'fr-mr-1w'
                      )}
                    />
                    <b>Non conforme</b>
                  </div>
                )}
                {residue.compliance === 'Other' && (
                  <div>
                    <span
                      className={clsx(
                        cx('fr-icon-alert-line', 'fr-mr-1w'),
                        'icon-grey'
                      )}
                    />
                    Conformité du résidu <b>autre</b>
                    {residue.otherCompliance && (
                      <div className={cx('fr-pl-4w')}>
                        <b>{quote(residue.otherCompliance)}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResidueResultOverview>
        </div>
      ))}
      <hr />
      <div>
        <h4 className="d-flex-align-center">
          <div className="flex-grow-1">Conformité globale de l'échantillon</div>
          {!readonly && (
            <Button
              priority="secondary"
              iconId="fr-icon-edit-line"
              className={cx('fr-mt-0')}
              size="small"
              onClick={() => {
                setEditingStatus('Compliance');
                editingConfirmationModal.open();
              }}
            >
              Éditer
            </Button>
          )}
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
      <ConfirmationModal
        modal={editingConfirmationModal}
        title="Confirmez que vous vous apprêtez à éditer les résultats d’analyse du prélèvement"
        onConfirm={editAnalysis}
      />
    </>
  );
};

export default SampleAnalysisOverview;

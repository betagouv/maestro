import Alert from '@codegouvfr/react-dsfr/Alert';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import Tag from '@codegouvfr/react-dsfr/Tag';
import clsx from 'clsx';
import { t } from 'i18next';
import { useMemo, useState } from 'react';
import { OptionalBooleanLabels } from 'shared/referential/OptionnalBoolean';
import { AnalyteLabels } from 'shared/referential/Residue/AnalyteLabels';
import { ComplexResidue } from 'shared/referential/Residue/ComplexResidue';
import { ComplexResidueLabels } from 'shared/referential/Residue/ComplexResidueLabels';
import { SimpleResidue } from 'shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from 'shared/referential/Residue/SimpleResidueLabels';
import { Analysis } from 'shared/schema/Analysis/Analysis';
import { AnalysisKindLabels } from 'shared/schema/Analysis/AnalysisKind';
import { ResidueKindLabels } from 'shared/schema/Analysis/Residue/ResidueKind';
import { Sample } from 'shared/schema/Sample/Sample';
import ConfirmationModal from 'src/components/ConfirmationModal/ConfirmationModal';
import DocumentLink from 'src/components/DocumentLink/DocumentLink';
import ResidueResultAlert from 'src/components/ResidueResultAlert/ResidueResultAlert';
import {
  useGetSampleAnalysisQuery,
  useUpdateAnalysisMutation
} from 'src/services/analysis.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';
import { pluralize, quote } from 'src/utils/stringUtils';
import './SampleAnalysisOverview.scss';
interface Props {
  sample: Sample;
}

const SampleAnalysisOverview = ({ sample }: Props) => {
  const { data } = useGetSampleAnalysisQuery(sample.id);
  const analysis = data as Analysis | undefined;

  const [updateAnalysis] = useUpdateAnalysisMutation();
  const [updateSample] = useUpdateSampleMutation();

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
      <div>
        <h6 className="d-flex-align-center">
          <span
            className={clsx(
              cx('fr-icon-newspaper-line', 'fr-mr-1w'),
              'icon-grey'
            )}
          ></span>
          <div className="flex-grow-1">Document du rapport d’analyse</div>
          <Button
            priority="secondary"
            iconId="fr-icon-edit-line"
            className={cx('fr-mt-0')}
            onClick={() => {
              setEditingStatus('Report');
              editingConfirmationModal.open();
            }}
          >
            Éditer
          </Button>
        </h6>
        <div className={cx('fr-pl-4w')}>
          <DocumentLink documentId={analysis.reportDocumentId} />
        </div>
      </div>
      <hr />
      <div>
        <h5 className="d-flex-align-center">
          <div className="flex-grow-1">
            {t('residue', { count: analysis.residues?.length || 0 })}
            {pluralize(analysis.residues?.length || 0)(' identifié')}
          </div>
          <Button
            priority="secondary"
            iconId="fr-icon-edit-line"
            className={cx('fr-mt-0')}
            onClick={() => {
              setEditingStatus('Residues');
              editingConfirmationModal.open();
            }}
          >
            Éditer
          </Button>
        </h5>
        Analyse {AnalysisKindLabels[analysis.kind]}
      </div>
      {analysis.residues?.map((residue, residueIndex) => (
        <div key={`residue-${residueIndex}`}>
          <h6 className={clsx(cx('fr-mb-2w'), 'd-flex-align-center')}>
            <span
              className={clsx(
                cx('fr-icon-microscope-line', 'fr-mr-1w'),
                'icon-grey'
              )}
            ></span>
            <span>Résidu n°{residueIndex + 1}</span>
            <Tag className={cx('fr-ml-1w', 'fr-text--regular')}>
              {ResidueKindLabels[residue.kind]}
            </Tag>
          </h6>
          <div className={clsx(cx('fr-pl-4w'), 'step-summary')}>
            {residue.kind === 'Simple' ? (
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
                    <ResidueResultAlert
                      result={residue.result}
                      lmr={residue.lmr}
                    />
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
                      {AnalyteLabels[analyte.reference]}
                      <div className="border-middle"></div>
                      {analyte.resultKind === 'Q' ? (
                        <b>{analyte.result} mg/kg</b>
                      ) : (
                        <b>Détecté, non quantifié</b>
                      )}
                    </div>
                  </div>
                ))}
                <h6 className={cx('fr-mb-0', 'fr-mt-2w')}>
                  Somme des analytes
                </h6>
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
            <h6 className={cx('fr-mb-0', 'fr-mt-2w')}>
              Interprétation du résultat
            </h6>
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
              </div>
            )}
          </div>
        </div>
      ))}
      <hr />
      <div>
        <h6 className="d-flex-align-center">
          <span
            className={clsx(cx('fr-icon-survey-line', 'fr-mr-1w'), 'icon-grey')}
          ></span>
          <div className="flex-grow-1">Conformité globale de l'échantillon</div>
          <Button
            priority="secondary"
            iconId="fr-icon-edit-line"
            className={cx('fr-mt-0')}
            onClick={() => {
              setEditingStatus('Compliance');
              editingConfirmationModal.open();
            }}
          >
            Éditer
          </Button>
        </h6>
        <div className={clsx(cx('fr-pl-4w'), 'step-summary')}>
          {analysis.compliance ? (
            <div>
              <span
                className={cx(
                  'fr-icon-success-fill',
                  'fr-label--success',
                  'fr-mr-1w'
                )}
              />
              Échantillon conforme
            </div>
          ) : (
            <div>
              <span
                className={cx(
                  'fr-icon-error-fill',
                  'fr-label--error',
                  'fr-mr-1w'
                )}
              />
              Échantillon non conforme
            </div>
          )}
          {analysis.notesOnCompliance && (
            <>
              <div>
                <span
                  className={clsx(
                    cx('fr-icon-quote-line', 'fr-mr-1w'),
                    'icon-grey'
                  )}
                ></span>
                Note additionnelle
              </div>
              <div className={cx('fr-pl-4w')}>
                <b>{quote(analysis.notesOnCompliance)}</b>
              </div>
            </>
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

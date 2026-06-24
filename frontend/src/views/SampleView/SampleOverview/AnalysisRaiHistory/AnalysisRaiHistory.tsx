import type { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import { format } from 'date-fns';
import type { AnalysisRaiState } from 'maestro-shared/schema/AnalysisRai/AnalysisRai';
import type { AnalysisRaiWithRelations } from 'maestro-shared/schema/AnalysisRai/AnalysisRaiWithRelations';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useState } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { ApiClientContext } from 'src/services/apiClient';
import { pluralize } from 'src/utils/stringUtils';
import { assert, type Equals } from 'tsafe';
import './AnalysisRaiHistory.scss';
import {
  DocumentsModal,
  documentsModal
} from 'src/components/DocumentsModal/DocumentsModal';
import { RetryModal, retryModal } from './RetryModal';

type Props = {
  rais: AnalysisRaiWithRelations[];
  showSampleReference?: boolean;
};

const raiStateConfig: Record<
  AnalysisRaiState,
  { severity: BadgeProps['severity']; label: string }
> = {
  PROCESSED: { severity: 'success', label: 'Traitée' },
  ERROR: { severity: 'error', label: 'Erreur' }
};

const RaiStateBadge = ({
  state,
  message
}: {
  state: AnalysisRaiState;
  message?: string | null;
}) => {
  const { severity, label } = raiStateConfig[state];
  const badge = (
    <Badge noIcon severity={severity}>
      {label}
    </Badge>
  );
  if (state === 'ERROR' && message) {
    return (
      <Tooltip kind="hover" title={<span>{message}</span>}>
        {badge}
      </Tooltip>
    );
  }
  return badge;
};

export const AnalysisRaiHistory = ({
  rais,
  showSampleReference = false,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [replayAnalysisRai, { isSuccess: isRetrySuccess }] =
    apiClient.useReplayAnalysisRaiMutation();

  const [selectedRai, setSelectedRai] =
    useState<AnalysisRaiWithRelations | null>(null);

  const handleRetry = async () => {
    if (!selectedRai) return;
    await replayAnalysisRai({ analysisRaiId: selectedRai.id });
  };

  const handleDocuments = (rai: AnalysisRaiWithRelations) => {
    setSelectedRai(rai);
    documentsModal.open();
  };

  const handleRetryOpen = (rai: AnalysisRaiWithRelations) => {
    setSelectedRai(rai);
    retryModal.open();
  };

  const tableData: React.ReactNode[][] = rais.map((rai) => [
    <span key={`${rai.id}-date`}>
      {format(rai.receivedAt, 'dd/MM/yyyy')} {format(rai.receivedAt, 'HH:mm')}
    </span>,
    <span key={`${rai.id}-source`}>
      {rai.source}
      {rai.edi && (
        <>
          {' '}
          <Badge noIcon severity="info" small>
            EDI
          </Badge>
        </>
      )}
    </span>,
    <RaiStateBadge
      key={`${rai.id}-state`}
      state={rai.state}
      message={rai.message}
    />,
    rai.laboratory ? (
      <Tooltip
        key={`${rai.id}-lab`}
        kind="hover"
        title={<span>{rai.laboratory.name}</span>}
      >
        <span>{rai.laboratory.shortName}</span>
      </Tooltip>
    ) : (
      <span key={`${rai.id}-lab`} className="rai-empty">
        —
      </span>
    ),
    rai.sampleItem ? (
      <Tag key={`${rai.id}-analysis`} small>
        {SubstanceKindLabels[rai.sampleItem.substanceKind]}
      </Tag>
    ) : (
      <span key={`${rai.id}-analysis`} className="rai-empty">
        —
      </span>
    ),
    rai.documents.length > 0 ? (
      <Button
        key={`${rai.id}-docs`}
        size="small"
        priority="tertiary no outline"
        iconId="fr-icon-file-line"
        onClick={() => handleDocuments(rai)}
      >
        {pluralize(rai.documents.length)('doc')}
      </Button>
    ) : (
      <span key={`${rai.id}-docs`} className="rai-empty">
        —
      </span>
    ),
    ...(showSampleReference
      ? [
          rai.sample ? (
            <a
              key={`${rai.id}-ref`}
              href={`/prelevements/${rai.sample.id}`}
              target="_blank"
              rel="noreferrer"
              style={{ whiteSpace: 'nowrap' }}
            >
              {rai.sample.reference}
            </a>
          ) : (
            <span key={`${rai.id}-ref`} className="rai-empty">
              —
            </span>
          )
        ]
      : []),
    rai.state === 'ERROR' ? (
      <Button
        key={`${rai.id}-action`}
        size="small"
        priority="secondary"
        onClick={() => handleRetryOpen(rai)}
      >
        Relancer
      </Button>
    ) : (
      <span key={`${rai.id}-action`} />
    )
  ]);

  return (
    <div className="analysis-rai-history">
      <h2 className={cx('fr-h4')}>Historique des RAI</h2>

      <AppToast open={isRetrySuccess} description="Relance effectuée" />

      {rais.length === 0 ? (
        <p className={cx('fr-text--sm')}>Aucune RAI.</p>
      ) : (
        <Table
          noCaption
          bordered
          noScroll
          fixed={false}
          headers={[
            'Date',
            'Source',
            'État',
            'Laboratoire',
            'Analyse',
            'Documents',
            ...(showSampleReference ? ['Prélèvement'] : []),
            'Actions'
          ]}
          data={tableData}
        />
      )}

      <RetryModal selectedRai={selectedRai} onRetry={handleRetry} />
      <DocumentsModal
        documents={selectedRai?.documents ?? []}
        sampleId={selectedRai?.sample?.id ?? ''}
      />
    </div>
  );
};

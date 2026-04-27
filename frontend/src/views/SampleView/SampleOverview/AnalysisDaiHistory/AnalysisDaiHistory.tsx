import type { BadgeProps } from '@codegouvfr/react-dsfr/Badge';
import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Table from '@codegouvfr/react-dsfr/Table';
import Tag from '@codegouvfr/react-dsfr/Tag';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import { format } from 'date-fns';
import type {
  AnalysisDaiAnalysisGroup,
  AnalysisDaiAttempt
} from 'maestro-shared/schema/AnalysisDai/AnalysisDaiAnalysisGroup';
import type { AnalysisDaiState } from 'maestro-shared/schema/AnalysisDai/AnalysisDaiState';
import { SubstanceKindLabels } from 'maestro-shared/schema/Substance/SubstanceKind';
import { useContext, useState } from 'react';
import AppToast from 'src/components/_app/AppToast/AppToast';
import { ApiClientContext } from 'src/services/apiClient';
import { pluralize } from 'src/utils/stringUtils';
import './AnalysisDaiHistory.scss';
import { assert, type Equals } from 'tsafe';
import { DocumentsModal, documentsModal } from './DocumentsModal';
import { RetryModal, retryModal } from './RetryModal';

type Props = {
  analyses: AnalysisDaiAnalysisGroup[];
  showSampleReference?: boolean;
};

const daiStateConfig: Record<
  AnalysisDaiState,
  { severity: BadgeProps['severity']; label: string }
> = {
  SENT: { severity: 'success', label: 'Envoyée' },
  ERROR: { severity: 'error', label: 'Erreur' },
  PENDING: { severity: 'info', label: 'En attente' }
};

const DaiStateBadge = ({
  state,
  message
}: {
  state: AnalysisDaiState;
  message?: string | null;
}) => {
  const { severity, label } = daiStateConfig[state];
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

const renderAttemptRow = (
  attempt: AnalysisDaiAttempt,
  group: AnalysisDaiAnalysisGroup,
  showSampleReference: boolean,
  firstCol: React.ReactNode,
  onDocuments: (a: AnalysisDaiAttempt) => void,
  onRetry: (a: AnalysisDaiAttempt) => void,
  isParent = false
): React.ReactNode[] => [
  firstCol,
  <span key={`${attempt.id}-date`}>
    {format(
      attempt.state === 'SENT' || (attempt.state === 'ERROR' && attempt.sentAt)
        ? attempt.sentAt
        : attempt.createdAt,
      'dd/MM/yyyy'
    )}
    <br />
    {format(
      attempt.state === 'SENT' || (attempt.state === 'ERROR' && attempt.sentAt)
        ? attempt.sentAt
        : attempt.createdAt,
      'HH:mm'
    )}
  </span>,
  <DaiStateBadge
    key={`${attempt.id}-state`}
    state={attempt.state}
    message={attempt.state === 'ERROR' ? attempt.message : null}
  />,
  <Tooltip
    key={`${attempt.id}-laboratory`}
    kind="hover"
    title={<span>{group.laboratory?.name ?? undefined}</span>}
  >
    <span>{group.laboratory?.shortName ?? undefined}</span>
  </Tooltip>,
  attempt.state !== 'PENDING' && attempt.sentMethod ? (
    attempt.sentMethod
  ) : (
    <span key={`${attempt.id}-sentMethod`} className="dai-empty">
      —
    </span>
  ),
  attempt.state !== 'PENDING' && attempt.edi !== null ? (
    <span
      key={`${attempt.id}-edi`}
      role="img"
      className={cx(
        attempt.edi
          ? 'fr-icon-checkbox-circle-line'
          : 'fr-icon-close-circle-line',
        'fr-icon--sm'
      )}
      aria-label={attempt.edi ? 'Oui' : 'Non'}
    />
  ) : (
    <span key={`${attempt.id}-edi`} className="dai-empty">
      —
    </span>
  ),
  attempt.documents.length > 0 ? (
    <Button
      key={`${attempt.id}-docs`}
      size="small"
      priority="tertiary no outline"
      iconId="fr-icon-file-line"
      onClick={() => onDocuments(attempt)}
    >
      {pluralize(attempt.documents.length)('doc')}
    </Button>
  ) : (
    <span key={`${attempt.id}-docs`} className="dai-empty">
      —
    </span>
  ),
  ...(showSampleReference
    ? [
        <a
          key={`${group.analysisId}-ref-${attempt.id}`}
          href={`/prelevements/${group.sample.id}`}
          target="_blank"
          rel="noreferrer"
        >
          {group.sample.reference}
        </a>
      ]
    : []),
  isParent && attempt.state === 'ERROR' ? (
    <Button
      key={`${attempt.id}-action`}
      size="small"
      priority="secondary"
      onClick={() => onRetry(attempt)}
    >
      Relancer
    </Button>
  ) : (
    <span key={`${attempt.id}-action`} />
  )
];

export const AnalysisDaiHistory = ({
  analyses,
  showSampleReference = false,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const [createAnalysisDai, { isSuccess: isRetrySuccess }] =
    apiClient.useCreateAnalysisDaiMutation();

  const [selectedDai, setSelectedDai] = useState<AnalysisDaiAttempt | null>(
    null
  );

  const handleRetry = async () => {
    if (!selectedDai) return;
    await createAnalysisDai({ analysisId: selectedDai.analysisId });
  };

  const handleDocuments = (attempt: AnalysisDaiAttempt) => {
    setSelectedDai(attempt);
    documentsModal.open();
  };

  const handleRetryOpen = (attempt: AnalysisDaiAttempt) => {
    setSelectedDai(attempt);
    retryModal.open();
  };

  const tableData = (() => {
    const result: React.ReactNode[][] = [];

    for (const group of analyses) {
      const latest = group.attempts[group.attempts.length - 1];
      const count = group.attempts.length;
      const hasChildren = count > 1;

      const analysisCell = (
        <span
          key={`${group.analysisId}-analysis`}
          className="dai-group-header-analyse"
        >
          <Tag small>{SubstanceKindLabels[group.sampleItem.substanceKind]}</Tag>
          {hasChildren && (
            <>
              <br />
              <span className="dai-group-toggle__meta">
                {pluralize(count, { preserveCount: true })('envoi')}
              </span>
            </>
          )}
        </span>
      );

      result.push(
        renderAttemptRow(
          latest,
          group,
          showSampleReference,
          analysisCell,
          handleDocuments,
          handleRetryOpen,
          true
        )
      );

      if (hasChildren) {
        for (const attempt of group.attempts.slice(0, -1).reverse()) {
          result.push(
            renderAttemptRow(
              attempt,
              group,
              showSampleReference,
              <span key={`${attempt.id}-analysis`} />,
              handleDocuments,
              handleRetryOpen
            )
          );
        }
      }
    }

    return result;
  })();

  return (
    <div className="analysis-dai-history">
      <h2 className={cx('fr-h4')}>Historique des DAI</h2>

      <AppToast open={isRetrySuccess} description="Nouvelle DAI créée" />

      {analyses.length === 0 ? (
        <p className={cx('fr-text--sm')}>Aucune DAI.</p>
      ) : (
        <Table
          noCaption
          bordered
          noScroll
          fixed={showSampleReference}
          headers={[
            'Analyse',
            'Date',
            'État',
            'Laboratoire',
            "Moyen d'envoi",
            'EDI',
            'Documents',
            ...(showSampleReference ? ['Prélèvement'] : []),
            'Actions'
          ]}
          data={tableData}
        />
      )}

      <RetryModal selectedDai={selectedDai} onRetry={handleRetry} />
      <DocumentsModal selectedDai={selectedDai} />
    </div>
  );
};

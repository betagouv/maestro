import Badge from '@codegouvfr/react-dsfr/Badge';
import type { DisplayStatusResult } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDisplayStatus';
import { formatDate } from 'maestro-shared/utils/date';

interface Props {
  result: DisplayStatusResult;
  showDates?: boolean;
  small?: boolean;
}

const severityByValue = {
  Submitted: 'success',
  InProgress: 'new',
  Pending: 'warning',
  ReadyToSend: 'info',
  NotApplicable: undefined
} as const;

const ProgrammingPlanDisplayStatusBadge = ({
  result,
  showDates,
  small
}: Props) => {
  if (result.value === 'NotApplicable') {
    return <span className="fr-text--sm fr-text-mention--grey">N/A</span>;
  }

  return (
    <div>
      <Badge severity={severityByValue[result.value]} noIcon small={small}>
        {result.label}
      </Badge>
      {showDates && result.sentAt && (
        <div className="fr-text--xs fr-text-mention--grey fr-mt-1v">
          Envoyé le {formatDate(result.sentAt)}
          {result.modified && result.lastModifiedAt && (
            <> · Modifié le {formatDate(result.lastModifiedAt)}</>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgrammingPlanDisplayStatusBadge;

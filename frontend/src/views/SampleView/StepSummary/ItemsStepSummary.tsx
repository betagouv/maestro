import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { uniqBy } from 'lodash-es';
import type {
  SampleChecked,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { formatDateTime } from 'maestro-shared/utils/date';
import { pluralize, quote } from 'src/utils/stringUtils';
import StepSummary, {
  type StepSummaryMode
} from 'src/views/SampleView/StepSummary/StepSummary';
import SampleItems from '../../../components/Sample/SampleItems/SampleItems';

interface Props {
  sample: (SampleChecked | SampleToCreate) & Partial<SampleOwnerData>;
  mode?: StepSummaryMode;
  onEdit?: () => void;
}

const ItemsStepSummary = ({ sample, mode = 'section', onEdit }: Props) => {
  return (
    <StepSummary
      title={pluralize(uniqBy(sample.items, 'itemNumber').length, {
        preserveCount: true
      })('échantillon prélevé')}
      onEdit={onEdit}
      mode={mode}
    >
      <div className="summary-item icon-text">
        <div className={cx('fr-icon-calendar-event-line')}></div>
        <div>
          Prélèvement réalisé le <b>{formatDateTime(sample.sampledAt)}</b>
        </div>
      </div>
      <SampleItems partialSample={sample} items={sample.items} readonly />
      {sample.notesOnItems && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>{quote(sample.notesOnItems)}</b>
            </div>
          </div>
        </div>
      )}
    </StepSummary>
  );
};

export default ItemsStepSummary;

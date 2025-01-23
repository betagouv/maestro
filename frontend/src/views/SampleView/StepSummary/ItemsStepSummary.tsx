import Badge from '@codegouvfr/react-dsfr/Badge';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'shared/schema/Sample/Sample';
import { usePartialSample } from 'src/hooks/usePartialSample';
import { pluralize, quote } from 'src/utils/stringUtils';
import SampleItemDetails from 'src/views/SampleView/SampleItemDetails/SampleItemDetails';
import StepSummary from 'src/views/SampleView/StepSummary/StepSummary';

interface Props {
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  showLabel?: boolean;
}

const ItemsStepSummary = ({ sample, showLabel }: Props) => {
  const { laboratory } = usePartialSample(sample);

  return (
    <StepSummary
      label={
        <Badge className={cx('fr-badge--green-menthe')}>
          {pluralize(sample.items.length)('Échantillon prélevé')}
        </Badge>
      }
      showLabel={showLabel}
    >
      <div className="sample-items">
        {sample.items?.map((item, itemIndex) => (
          <div
            className={clsx(
              cx('fr-callout', 'fr-callout--pink-tuile'),
              'sample-callout'
            )}
            key={`item-${itemIndex}`}
          >
            <SampleItemDetails
              item={item}
              itemIndex={itemIndex}
              laboratory={laboratory}
            />
          </div>
        ))}
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
      </div>
    </StepSummary>
  );
};

export default ItemsStepSummary;

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import React from 'react';
import { Sample, SampleToCreate } from 'shared/schema/Sample/Sample';
import { SampleItem } from 'shared/schema/Sample/SampleItem';
import SampleItemDetails from 'src/views/SampleView/SampleItemDetails/SampleItemDetails';

interface Props {
  sample: Sample | SampleToCreate;
  itemChildren?: (item: SampleItem, itemIndex: number) => React.ReactNode;
}

const ItemsStepSummary = ({ sample, itemChildren }: Props) => {
  return (
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
            laboratoryId={sample.laboratoryId}
          >
            {itemChildren && itemChildren(item, itemIndex)}
          </SampleItemDetails>
        </div>
      ))}
      {sample.notesOnItems && (
        <div className="summary-item icon-text">
          <div className={cx('fr-icon-quote-line')}></div>
          <div>
            Note additionnelle{' '}
            <div>
              <b>“ {sample.notesOnItems} “</b>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsStepSummary;

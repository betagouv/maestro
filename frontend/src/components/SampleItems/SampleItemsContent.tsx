import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import {
  PartialSampleItem,
  SampleItemMaxCopyCount
} from 'maestro-shared/schema/Sample/SampleItem';
import { Fragment } from 'react';
import { UseForm } from '../../hooks/useForm';
import SampleItemContent from './SampleItemContent';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  items: (PartialSampleItem & { sampleItemIndex: number })[];
  onChangeItem?: (items: PartialSampleItem) => void;
  onRemoveItem?: (item: PartialSampleItem) => void;
  onAddItem?: (item: PartialSampleItem) => void;
  readonly: boolean;
  form?: UseForm<any>;
}

const SampleItemsContent = ({
  partialSample,
  items,
  onChangeItem,
  onRemoveItem,
  onAddItem,
  readonly,
  form
}: Props) => {
  return (
    <div className="d-flex-column">
      {items.map((item, index) => (
        <Fragment key={`item-${item.itemNumber}-${item.copyNumber}`}>
          <SampleItemContent
            partialSample={partialSample}
            item={item}
            itemIndex={item.sampleItemIndex}
            onRemoveItem={onRemoveItem}
            onChangeItem={onChangeItem}
            itemsForm={form}
            readonly={readonly}
          />
          {index < items.length - 1 && <hr className={cx('fr-mx-0')} />}
        </Fragment>
      ))}
      {items[items.length - 1]?.copyNumber < SampleItemMaxCopyCount &&
        !readonly &&
        onAddItem && (
          <>
            <hr className={cx('fr-mx-0')} />
            <Button
              priority="tertiary no outline"
              onClick={(e) => {
                e.preventDefault();
                const lastItem = items[items.length - 1];
                onAddItem({
                  sampleId: partialSample.id,
                  itemNumber: lastItem.itemNumber,
                  copyNumber: lastItem.copyNumber + 1,
                  quantity: lastItem.quantity,
                  quantityUnit: lastItem.quantityUnit,
                  substanceKind: lastItem.substanceKind
                });
              }}
              className={cx('fr-my-1w')}
              size="small"
              style={{
                alignSelf: 'center'
              }}
              data-testid="add-item-button"
            >
              Ajouter un exemplaire
            </Button>
          </>
        )}
    </div>
  );
};
export default SampleItemsContent;

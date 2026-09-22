import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import type {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import type { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { Fragment } from 'react';
import type { UseForm } from '../../../hooks/useForm';
import { usePartialSample } from '../../../hooks/usePartialSample';
import SampleItemContent from './SampleItemContent';
import {
  defaultCopyRecipientKind,
  isRemovableCopy,
  nextCopyNumber
} from './sampleItemCopies';

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
  const { programmingSubPlan } = usePartialSample(partialSample);
  const samples = programmingSubPlan?.samples ?? [];
  const itemNumber = items[0]?.itemNumber;
  const addedCopyNumber = itemNumber && nextCopyNumber(items, itemNumber);

  return (
    <div className="d-flex-column">
      {items.map((item, index) => (
        <Fragment key={`item-${item.itemNumber}-${item.copyNumber}`}>
          <SampleItemContent
            partialSample={partialSample}
            item={item}
            itemIndex={item.sampleItemIndex}
            removable={isRemovableCopy(samples, items, item)}
            onRemoveItem={onRemoveItem}
            onChangeItem={onChangeItem}
            itemsForm={form}
            readonly={readonly}
          />
          {index < items.length - 1 && <hr className={cx('fr-mx-0')} />}
        </Fragment>
      ))}
      {addedCopyNumber && !readonly && onAddItem && (
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
                copyNumber: addedCopyNumber,
                quantity: lastItem.quantity,
                quantityUnit: lastItem.quantityUnit,
                substanceKinds: lastItem.substanceKinds,
                recipientKind: defaultCopyRecipientKind(samples, items, {
                  itemNumber: lastItem.itemNumber,
                  copyNumber: addedCopyNumber
                }),
                compliance200263:
                  programmingSubPlan?.subPlanNumber === 'PPV' ? undefined : true
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

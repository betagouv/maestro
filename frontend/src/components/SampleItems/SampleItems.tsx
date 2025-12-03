import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { minBy, uniqBy } from 'lodash-es';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import {
  SubstanceKind,
  SubstanceKindLabels
} from 'maestro-shared/schema/Substance/SubstanceKind';
import { useMemo, useState } from 'react';
import { UseForm } from '../../hooks/useForm';
import SampleItemsContent from './SampleItemsContent';

interface Props {
  partialSample: PartialSample | PartialSampleToCreate;
  items: PartialSampleItem[];
  onChangeItem?: (items: PartialSampleItem) => void;
  onRemoveItem?: (item: PartialSampleItem) => void;
  onAddItem?: (item: PartialSampleItem) => void;
  readonly: boolean;
  form?: UseForm<any>;
}

const SampleItems = ({
  partialSample,
  items,
  onChangeItem,
  onRemoveItem,
  onAddItem,
  readonly,
  form
}: Props) => {
  const [selectedTabId, setSelectedTabId] = useState<string>(
    String(minBy(items, 'itemNumber')?.itemNumber ?? 1)
  );

  const groupedItems = useMemo(
    () =>
      items?.reduce(
        (acc, item, itemIndex) => {
          acc[item.itemNumber - 1].push({
            ...item,
            sampleItemIndex: itemIndex
          });
          return acc;
        },
        Array.from({
          length: uniqBy(items, 'itemNumber').length
        }).map((_) => []) as (PartialSampleItem & {
          sampleItemIndex: number;
        })[][]
      ),
    [items]
  );

  if (!groupedItems?.length) {
    return <></>;
  }

  return (
    <div>
      <h5>Échantillons</h5>
      {groupedItems.length > 1 ? (
        <Tabs
          selectedTabId={selectedTabId}
          onTabChange={setSelectedTabId}
          tabs={groupedItems.map((groupedItem, groupIndex) => ({
            label: `Éch. N°${groupIndex + 1} - ${SubstanceKindLabels[groupedItem[0].substanceKind as SubstanceKind]}`,
            tabId: String(groupIndex + 1)
          }))}
          classes={{
            panel: cx('fr-p-0')
          }}
        >
          <SampleItemsContent
            items={groupedItems[Number(selectedTabId) - 1]}
            onChangeItem={onChangeItem}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            partialSample={partialSample}
            readonly={readonly}
            form={form}
          />
        </Tabs>
      ) : (
        <div className={clsx('sample-items')}>
          <SampleItemsContent
            items={groupedItems[0]}
            onChangeItem={onChangeItem}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            partialSample={partialSample}
            readonly={readonly}
            form={form}
          />
        </div>
      )}
    </div>
  );
};

export default SampleItems;

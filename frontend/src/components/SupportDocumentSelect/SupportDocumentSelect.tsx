import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import {
  SampleChecked,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import {
  SampleItem,
  SampleItemSort
} from 'maestro-shared/schema/Sample/SampleItem';
import { useState } from 'react';
import { useDocument } from 'src/hooks/useDocument';
import { getSupportDocumentURL } from 'src/services/sample.service';
import './SupportDocumentSelect.scss';
type Props = {
  label?: string;
  sample: (SampleChecked | SampleToCreate) & Partial<SampleOwnerData>;
  renderButtons: (onClick: () => void) => React.ReactElement;
};

const SupportDocumentSelect = ({ label, sample, renderButtons }: Props) => {
  const { openDocument } = useDocument();

  const [selectedItem, setSelectedItem] = useState(0);

  if (sample.items.length === 0) {
    return <></>;
  }

  const sortedItems = [...sample.items].sort(SampleItemSort);

  const getDocument = async (sampleItem: SampleItem) => {
    if (sampleItem.supportDocumentId) {
      await openDocument(sampleItem.supportDocumentId);
    } else {
      window.open(
        getSupportDocumentURL(
          sample.id,
          sampleItem.itemNumber,
          sampleItem.copyNumber
        )
      );
    }
  };

  return (
    <div className="select-with-button">
      <Select
        className={cx('fr-mr-2w')}
        label={label ?? "Document d'accompagnement"}
        nativeSelectProps={{
          onChange: (event) => setSelectedItem(Number(event.target.value)),
          value: selectedItem
        }}
      >
        {sortedItems.map((item, itemIndex) => (
          <option
            key={`sample-item-${item.itemNumber}-${item.copyNumber}`}
            value={itemIndex}
          >
            {`Echantillon ${item.itemNumber} - exemplaire n°${item.copyNumber}`}
          </option>
        ))}
      </Select>
      {renderButtons(() => getDocument(sample.items[selectedItem]))}
    </div>
  );
};

export default SupportDocumentSelect;

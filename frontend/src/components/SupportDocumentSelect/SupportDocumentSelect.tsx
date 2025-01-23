import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import { useState } from 'react';
import { SampleItem } from 'shared/schema/Sample/SampleItem';
import { useDocument } from 'src/hooks/useDocument';
import { getSupportDocumentURL } from 'src/services/sample.service';
import './SupportDocumentSelect.scss';
export interface Props {
  label?: string;
  sampleId: string;
  sampleItems: SampleItem[];
  renderButtons: (onClick: () => void) => React.ReactElement;
}

const SupportDocumentSelect = ({
  label,
  sampleId,
  sampleItems,
  renderButtons
}: Props) => {
  const { openDocument } = useDocument();

  const [selectedItemNumber, setSelectedItemNumber] = useState(1);

  if (sampleItems.length === 0) {
    return <></>;
  }

  const getDocument = async (sampleItem: SampleItem) => {
    if (sampleItem.supportDocumentId) {
      await openDocument(sampleItem.supportDocumentId);
    } else {
      window.open(getSupportDocumentURL(sampleId, sampleItem.itemNumber));
    }
  };

  return sampleItems.length === 1 ? (
    renderButtons(() => getDocument(sampleItems[0]))
  ) : (
    <div className="select-with-button">
      <Select
        className={cx('fr-mr-2w')}
        label={label ?? "Document d'accompagnement"}
        nativeSelectProps={{
          onChange: (event) =>
            setSelectedItemNumber(Number(event.target.value)),
          value: selectedItemNumber
        }}
      >
        {sampleItems.map((item) => (
          <option
            key={`sample-item-${item.itemNumber}`}
            value={item.itemNumber}
            label={`Echantillon n°${item.itemNumber}`}
          >
            {item.itemNumber}
          </option>
        ))}
      </Select>
      {renderButtons(() => getDocument(sampleItems[selectedItemNumber - 1]))}
    </div>
  );
};

export default SupportDocumentSelect;

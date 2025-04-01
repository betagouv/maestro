import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import clsx from 'clsx';
import {
  Sample,
  SampleOwnerData,
  SampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { SampleItem } from 'maestro-shared/schema/Sample/SampleItem';
import { useState } from 'react';
import { useDocument } from 'src/hooks/useDocument';
import { getSupportDocumentURL } from 'src/services/sample.service';
import './SupportDocumentSelect.scss';
export interface Props {
  label?: string;
  sample: (Sample | SampleToCreate) & Partial<SampleOwnerData>;
  renderButtons: (onClick: () => void) => React.ReactElement;
}

const SupportDocumentSelect = ({ label, sample, renderButtons }: Props) => {
  const { openDocument } = useDocument();

  const [selectedItemNumber, setSelectedItemNumber] = useState(1);

  if (sample.items.length === 0) {
    return <></>;
  }

  const getDocument = async (sampleItem: SampleItem) => {
    if (sampleItem.supportDocumentId) {
      await openDocument(sampleItem.supportDocumentId);
    } else {
      window.open(
        getSupportDocumentURL(sample.id, sampleItem.itemNumber, true)
      );
    }
  };

  return sample.items.length === 1 ? (
    <div className="d-flex-align-center">
      {label && (
        <label className={clsx(cx('fr-label'), 'flex-grow-1')}>{label}</label>
      )}
      {renderButtons(() => getDocument(sample.items[0]))}
    </div>
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
        {sample.items.map((item) => (
          <option
            key={`sample-item-${item.itemNumber}`}
            value={item.itemNumber}
            label={`Echantillon n°${item.itemNumber}`}
          >
            {item.itemNumber}
          </option>
        ))}
      </Select>
      {renderButtons(() => getDocument(sample.items[selectedItemNumber - 1]))}
    </div>
  );
};

export default SupportDocumentSelect;

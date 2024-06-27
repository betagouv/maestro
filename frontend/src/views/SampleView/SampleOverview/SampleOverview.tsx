import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Select from '@codegouvfr/react-dsfr/Select';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { Sample } from 'shared/schema/Sample/Sample';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocument } from 'src/hooks/useDocument';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import SampleTracking from 'src/views/SampleView/SampleOverview/SampleTracking';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import CreationStepSummary from 'src/views/SampleView/StepSummary/CreationStepSummary';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';

interface Props {
  sample: Sample;
}

const SampleOverview = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);

  const { openDocument } = useDocument();

  const itemsWithSupportDocument = useMemo(
    () => sample.items.filter((item) => item.supportDocumentId),
    [sample.items]
  );

  const [supportDocumentId, setSupportDocumentId] = useState<string>(
    itemsWithSupportDocument[0]?.supportDocumentId ?? ''
  );

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title={<>Prélèvement {sample.reference}</>}
        subtitle="Consultez le récapitulatif du prélèvement réalisé"
        illustration={food}
        action={
          itemsWithSupportDocument.length > 0 &&
          itemsWithSupportDocument.length === 1 ? (
            <Button
              priority="secondary"
              onClick={() =>
                openDocument(sample.items[0].supportDocumentId as string)
              }
              iconId="fr-icon-file-download-line"
            >
              Document d'accompagnement
            </Button>
          ) : (
            <div className="select-with-button">
              <Select
                label="Document d'accompagnement"
                nativeSelectProps={{
                  onChange: (event) => setSupportDocumentId(event.target.value),
                  value: supportDocumentId,
                }}
              >
                {itemsWithSupportDocument.map((item) =>
                  item.supportDocumentId ? (
                    <option
                      key={item.supportDocumentId}
                      value={item.supportDocumentId}
                      label={`Echantillon n°${item.itemNumber}`}
                    >
                      {item.supportDocumentId}
                    </option>
                  ) : (
                    <></>
                  )
                )}
              </Select>
              <Button
                iconId="fr-icon-file-download-line"
                onClick={() => openDocument(supportDocumentId as string)}
                title="Télécharger"
              />
            </div>
          )
        }
      />
      <Tabs
        tabs={[
          {
            label: 'Suivi du prélèvement',
            content: <SampleTracking sample={sample} />,
          },
          {
            label: SampleStepTitles[0],
            content: <CreationStepSummary sample={sample} />,
          },
          {
            label: SampleStepTitles[1],
            content: <MatrixStepSummary sample={sample} />,
          },
          {
            label: SampleStepTitles[2],
            content: <ItemsStepSummary sample={sample} />,
          },
        ]}
        classes={{
          panel: 'white-container',
        }}
      />
    </section>
  );
};

export default SampleOverview;

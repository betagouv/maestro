import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { Sample } from 'shared/schema/Sample/Sample';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import SampleTracking from 'src/views/SampleView/SentSample/SampleTracking';
import CreationStepSummary from 'src/views/SampleView/StepSummary/CreationStepSummary';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';

interface Props {
  sample: Sample;
}

const SentSample = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);

  return (
    <section className={clsx(cx('fr-container'), 'main-section')}>
      <SectionHeader
        title={<>Prélèvement {sample.reference}</>}
        subtitle="Consultez le récapitulatif du prélèvement réalisé"
        illustration={food}
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

export default SentSample;

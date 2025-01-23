import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Tabs from '@codegouvfr/react-dsfr/Tabs';
import clsx from 'clsx';
import { Sample } from 'shared/schema/Sample/Sample';
import food from 'src/assets/illustrations/food.svg';
import SectionHeader from 'src/components/SectionHeader/SectionHeader';
import SupportDocumentSelect from 'src/components/SupportDocumentSelect/SupportDocumentSelect';
import { useDocumentTitle } from 'src/hooks/useDocumentTitle';
import { useSamplesLink } from 'src/hooks/useSamplesLink';
import SampleAnalysis from 'src/views/SampleView/SampleAnalysis/SampleAnalysis';
import SampleOverviewContextTab from 'src/views/SampleView/SampleOverview/SampleOverviewContextTab';
import { SampleStepTitles } from 'src/views/SampleView/SampleView';
import ItemsStepSummary from 'src/views/SampleView/StepSummary/ItemsStepSummary';
import MatrixStepSummary from 'src/views/SampleView/StepSummary/MatrixStepSummary';
import './SampleOverview.scss';
interface Props {
  sample: Sample;
}

const SampleOverview = ({ sample }: Props) => {
  useDocumentTitle(`Prélèvement ${sample.reference}`);

  const { navigateToSamples } = useSamplesLink();

  return (
    <section
      className={clsx(cx('fr-container'), 'main-section', 'sample-overview')}
    >
      <SectionHeader
        title={<>Prélèvement {sample.reference}</>}
        subtitle="Consultez le récapitulatif du prélèvement réalisé"
        illustration={food}
        action={
          <SupportDocumentSelect
            sampleId={sample.id}
            sampleItems={sample.items.filter((item) => item.supportDocumentId)}
            renderButtons={(onClick) => (
              <Button
                priority="secondary"
                iconId="fr-icon-file-download-line"
                onClick={onClick}
              >
                Document d'accompagnement
              </Button>
            )}
          />
        }
      />
      <Tabs
        tabs={[
          {
            label: 'Suivi du prélèvement',
            content: <SampleAnalysis sample={sample} />
          },
          {
            label: SampleStepTitles(sample)[0],
            content: <SampleOverviewContextTab sample={sample} />
          },
          {
            label: SampleStepTitles(sample)[1],
            content: <MatrixStepSummary sample={sample} showLabel={false} />
          },
          {
            label: SampleStepTitles(sample)[2],
            content: <ItemsStepSummary sample={sample} />
          }
        ]}
        classes={{
          panel: 'white-container'
        }}
      />
      <div className="back">
        <Button
          priority="secondary"
          onClick={navigateToSamples}
          iconId="fr-icon-arrow-left-line"
        >
          Retour aux prélèvements
        </Button>
      </div>
    </section>
  );
};

export default SampleOverview;

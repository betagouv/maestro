import {
  PartialSample,
  PartialSampleToCreate,
  Sample
} from 'maestro-shared/schema/Sample/Sample';
import { DraftStatusList } from 'maestro-shared/schema/Sample/SampleStatus';
import { useParams } from 'react-router';
import { useAppSelector } from 'src/hooks/useStore';
import { useGetSampleQuery } from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import DraftSample from 'src/views/SampleView/DraftSample/DraftSample';
import SampleOverview from 'src/views/SampleView/SampleOverview/SampleOverview';
import './SampleView.scss';

export const SampleStepTitles = (
  sample?: PartialSample | PartialSampleToCreate
) => [
  'Contexte du prélèvement',
  'Matrice contrôlée',
  pluralize(sample?.items?.length ?? 0)('Échantillon'),
  'Récapitulatif'
];

const SampleView = () => {
  const { sampleId } = useParams<{ sampleId?: string }>();

  const { pendingSamples } = useAppSelector((state) => state.samples);
  const { data } = useGetSampleQuery(sampleId as string, {
    skip: !sampleId || sampleId in pendingSamples
  });

  const sample = pendingSamples[sampleId ?? ''] ?? data;

  if (!sampleId) {
    return <DraftSample />;
  }

  if (!sample) {
    return <></>;
  }

  return (
    <>
      {[...DraftStatusList, 'Submitted'].includes(sample.status) ? (
        <DraftSample sample={sample} />
      ) : (
        <SampleOverview sample={sample as Sample} />
      )}
    </>
  );
};

export default SampleView;

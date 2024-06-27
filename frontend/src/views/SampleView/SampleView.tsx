import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router-dom';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import { DraftStatusList } from 'shared/schema/Sample/SampleStatus';
import { useGetSampleQuery } from 'src/services/sample.service';
import { pluralize } from 'src/utils/stringUtils';
import DraftSample from 'src/views/SampleView/DraftSample/DraftSample';
import SampleOverview from 'src/views/SampleView/SampleOverview/SampleOverview';
import './SampleView.scss';

export const SampleStepTitles = (sample?: PartialSample) => [
  'Contexte du prélèvement',
  'Matrice contrôlée',
  pluralize(sample?.items?.length ?? 0)('Échantillon'),
  'Récapitulatif',
];

const SampleView = () => {
  const { sampleId } = useParams<{ sampleId?: string }>();

  const { data: sample } = useGetSampleQuery(sampleId ?? skipToken);

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

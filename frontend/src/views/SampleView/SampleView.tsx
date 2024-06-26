import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router-dom';
import { Sample } from 'shared/schema/Sample/Sample';
import { DraftStatusList } from 'shared/schema/Sample/SampleStatus';
import { useGetSampleQuery } from 'src/services/sample.service';
import DraftSample from 'src/views/SampleView/DraftSample/DraftSample';
import SentSample from 'src/views/SampleView/SentSample/SentSample';
import './SampleView.scss';

export const SampleStepTitles = [
  'Contexte du prélèvement',
  'Matrice contrôlée',
  'Echantillons',
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
        <SentSample sample={sample as Sample} />
      )}
    </>
  );
};

export default SampleView;

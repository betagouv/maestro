import type {
  PartialSample,
  PartialSampleToCreate,
  SampleChecked
} from 'maestro-shared/schema/Sample/Sample';
import { useContext } from 'react';
import { useParams } from 'react-router';
import { pluralize } from 'src/utils/stringUtils';
import DraftSample from 'src/views/SampleView/DraftSample/DraftSample';
import SampleOverview from 'src/views/SampleView/SampleOverview/SampleOverview';
import { ApiClientContext } from '../../services/apiClient';
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
  const apiClient = useContext(ApiClientContext);
  const { sampleId } = useParams<{ sampleId?: string }>();

  const { data } = apiClient.useGetSampleQuery(
    { sampleId: sampleId as string },
    { skip: !sampleId }
  );

  const sample = data;

  if (!sampleId) {
    return <DraftSample />;
  }

  if (!sample) {
    return null;
  }

  return (
    <>
      {sample.step !== 'Sent' ? (
        <DraftSample sample={sample} />
      ) : (
        <SampleOverview sample={sample as SampleChecked} />
      )}
    </>
  );
};

export default SampleView;

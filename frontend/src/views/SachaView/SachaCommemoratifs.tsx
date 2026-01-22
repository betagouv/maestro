import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { MatrixSpecificDataFormInputs } from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { SachaCommemoratifRecord } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { getRecordKeys } from 'maestro-shared/utils/typescript';
import { FunctionComponent, useContext } from 'react';
import { ApiClientContext } from '../../services/apiClient';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';

export const SachaCommemoratifs: FunctionComponent = () => {
  const { useGetSachaCommemoratifsQuery, useGetSampleSpecificDataQuery } =
    useContext(ApiClientContext);

  const { data: sachaCommemoratifs } = useGetSachaCommemoratifsQuery();
  const { data: programmingPlanSpecifiDataRecord } =
    useGetSampleSpecificDataQuery();

  return (
    <div>
      <SachaCommemoratifsUpload />

      {!!sachaCommemoratifs && !!programmingPlanSpecifiDataRecord && (
        <CommemoratifsForAProgrammingPlanKind
          sachaCommemoratifs={sachaCommemoratifs}
          programmingPlanSpecifiDataRecord={programmingPlanSpecifiDataRecord}
        />
      )}
    </div>
  );
};

const CommemoratifsForAProgrammingPlanKind = ({
  sachaCommemoratifs,
  programmingPlanSpecifiDataRecord
}: {
  sachaCommemoratifs: SachaCommemoratifRecord;
  programmingPlanSpecifiDataRecord: SampleSpecificDataRecord;
}) => {
  const attributes = getRecordKeys(MatrixSpecificDataFormInputs);

  return (
    <div>
      {attributes.map((attribute) => (
        <>
          <CommemoratifSigleForm
            key={attribute as string}
            attribute={attribute}
            sachaCommemoratifs={sachaCommemoratifs}
            programmingPlanSpecifiDataRecord={programmingPlanSpecifiDataRecord}
          />
          <hr className={cx('fr-mb-2w')} />
        </>
      ))}
    </div>
  );
};

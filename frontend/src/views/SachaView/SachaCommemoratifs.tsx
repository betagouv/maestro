import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { uniq } from 'lodash-es';
import { SampleMatrixSpecificDataKeys } from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SachaCommemoratifRecord } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { schemasByProgrammingPlanKind } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
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
  const attributes = uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((kind) =>
      Object.keys(schemasByProgrammingPlanKind[kind].shape)
    )
  ).filter(
    (key): key is SampleMatrixSpecificDataKeys => key !== 'programmingPlanKind'
  );

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

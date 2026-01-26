import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { MatrixSpecificDataFormInputs } from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { SachaCommemoratifRecord } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { SampleSpecificDataRecord } from 'maestro-shared/schema/Sample/SampleSpecificDataAttribute';
import { FunctionComponent, useContext, useMemo } from 'react';
import { ApiClientContext } from '../../services/apiClient';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';
import {
  canHaveValue,
  getAllSachaAttributes,
  getAttributeExpectedValues
} from './sachaUtils';

export const SachaCommemoratifs: FunctionComponent = () => {
  const { useGetSachaCommemoratifsQuery, useGetSampleSpecificDataQuery } =
    useContext(ApiClientContext);

  const { data: sachaCommemoratifs } = useGetSachaCommemoratifsQuery();
  const { data: sampleSpecifiDataRecord } = useGetSampleSpecificDataQuery();

  const isComplete = useMemo(() => {
    if (!sampleSpecifiDataRecord) {
      return true;
    }

    for (const attribute of getAllSachaAttributes()) {
      const attributeConf = sampleSpecifiDataRecord[attribute];

      if (attributeConf?.inDai) {
        if (!attributeConf.sachaCommemoratifSigle) {
          return false;
        }
        const inputConf = MatrixSpecificDataFormInputs[attribute];

        if (canHaveValue(inputConf)) {
          const expectedValues = getAttributeExpectedValues(attribute);

          const hasValueWithoutSigle = expectedValues.some(
            (value) => !attributeConf.values[value]
          );

          if (hasValueWithoutSigle) {
            return false;
          }
        }
      }
    }

    return true;
  }, [sampleSpecifiDataRecord]);

  return (
    <div>
      <SachaCommemoratifsUpload />

      {!isComplete && (
        <Alert
          severity={'warning'}
          title={'Configuration incomplète'}
          description={'Certaine DAI ne sont pas envoyables via les EDI Sacha.'}
          className={clsx(cx('fr-mb-3w'))}
        />
      )}

      {!!sachaCommemoratifs && !!sampleSpecifiDataRecord && (
        <CommemoratifsForAProgrammingPlanKind
          sachaCommemoratifs={sachaCommemoratifs}
          sampleSpecifiDataRecord={sampleSpecifiDataRecord}
        />
      )}
    </div>
  );
};

const CommemoratifsForAProgrammingPlanKind = ({
  sachaCommemoratifs,
  sampleSpecifiDataRecord
}: {
  sachaCommemoratifs: SachaCommemoratifRecord;
  sampleSpecifiDataRecord: SampleSpecificDataRecord;
}) => {
  return (
    <div className={clsx('d-flex-column')} style={{ gap: '2rem' }}>
      {getAllSachaAttributes().map((attribute) => (
        <CommemoratifSigleForm
          key={attribute as string}
          attribute={attribute}
          sachaCommemoratifs={sachaCommemoratifs}
          sampleSpecifiDataRecord={sampleSpecifiDataRecord}
        />
      ))}
    </div>
  );
};

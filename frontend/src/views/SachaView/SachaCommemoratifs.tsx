import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { FunctionComponent, useContext, useMemo } from 'react';
import { ApiClientContext } from '../../services/apiClient';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';

export const SachaCommemoratifs: FunctionComponent = () => {
  const {
    useGetSachaCommemoratifsQuery,
    useGetSampleSpecificDataQuery,
    useFindPlanKindFieldConfigsQuery
  } = useContext(ApiClientContext);

  const { data: sachaCommemoratifs } = useGetSachaCommemoratifsQuery();
  const { data: sampleSpecifiDataRecord } = useGetSampleSpecificDataQuery();
  const { data: breedingFieldConfigs = [] } =
    useFindPlanKindFieldConfigsQuery('DAOA_BREEDING');
  const { data: slaughterFieldConfigs = [] } =
    useFindPlanKindFieldConfigsQuery('DAOA_SLAUGHTER');

  const sachaFieldConfigs = useMemo(() => {
    const seen = new Set<string>();
    return [...breedingFieldConfigs, ...slaughterFieldConfigs].filter((fc) => {
      if (seen.has(fc.field.key)) return false;
      seen.add(fc.field.key);
      return true;
    });
  }, [breedingFieldConfigs, slaughterFieldConfigs]);

  const isComplete = useMemo(() => {
    if (!sampleSpecifiDataRecord) {
      return true;
    }

    for (const fc of sachaFieldConfigs) {
      const attributeConf = sampleSpecifiDataRecord[fc.field.key];

      if (attributeConf?.inDai && !attributeConf?.optional) {
        if (!attributeConf.sachaCommemoratifSigle) {
          return false;
        }
        const canHaveVal =
          fc.field.inputType === 'select' || fc.field.inputType === 'radio';
        if (canHaveVal) {
          const expectedValues = fc.field.options.map((o) => o.value);
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
  }, [sampleSpecifiDataRecord, sachaFieldConfigs]);

  return (
    <div>
      <SachaCommemoratifsUpload />

      {!isComplete && (
        <Alert
          severity={'warning'}
          title={'Configuration incomplète'}
          description={
            'Certaines DAI ne sont pas envoyables via les EDI Sacha.'
          }
          className={clsx(cx('fr-mb-3w'))}
        />
      )}

      {!!sachaCommemoratifs && !!sampleSpecifiDataRecord && (
        <div className={clsx('d-flex-column')} style={{ gap: '2rem' }}>
          {sachaFieldConfigs.map((fc) => (
            <CommemoratifSigleForm
              key={fc.field.key}
              fieldConfig={fc.field}
              sachaCommemoratifs={sachaCommemoratifs}
              sampleSpecifiDataRecord={sampleSpecifiDataRecord}
            />
          ))}
        </div>
      )}
    </div>
  );
};

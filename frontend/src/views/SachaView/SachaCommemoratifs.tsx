import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { type FunctionComponent, useContext, useMemo } from 'react';
import { ApiClientContext } from '../../services/apiClient';
import { CommemoratifSigleForm } from './CommemoratifSigleForm';
import { SachaCommemoratifsUpload } from './SachaCommemoratifsUpload';

export const SachaCommemoratifs: FunctionComponent = () => {
  const { useGetSachaCommemoratifsQuery, useFindSachaFieldConfigsQuery } =
    useContext(ApiClientContext);

  const { data: sachaCommemoratifs } = useGetSachaCommemoratifsQuery();
  const { data: sachaFieldConfigs = [] } = useFindSachaFieldConfigsQuery();

  const isComplete = useMemo(() => {
    for (const fc of sachaFieldConfigs) {
      if (fc.inDai && !fc.optional) {
        if (!fc.sachaCommemoratifSigle) {
          return false;
        }
        const canHaveVal =
          fc.inputType === 'select' || fc.inputType === 'radio';
        if (
          canHaveVal &&
          fc.options.some((o) => !o.sachaCommemoratifValueSigle)
        ) {
          return false;
        }
      }
    }
    return true;
  }, [sachaFieldConfigs]);

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

      {!!sachaCommemoratifs && (
        <div className={clsx('d-flex-column')} style={{ gap: '2rem' }}>
          {sachaFieldConfigs.map((fc) => (
            <CommemoratifSigleForm
              key={fc.key}
              fieldConfig={fc}
              sachaCommemoratifs={sachaCommemoratifs}
            />
          ))}
        </div>
      )}
    </div>
  );
};

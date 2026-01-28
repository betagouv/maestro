import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { ChangeEvent, FunctionComponent, useContext, useRef } from 'react';
import { ApiClientContext } from '../../services/apiClient';

export const SachaCommemoratifsUpload: FunctionComponent = () => {
  const { useUpdateSachaCommemoratifsMutation } = useContext(ApiClientContext);

  const [updateSachaCommemoratifs, { isLoading, isError, isSuccess }] =
    useUpdateSachaCommemoratifsMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const xmlContent = await file.text();
      await updateSachaCommemoratifs(xmlContent);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div
        className={clsx('d-flex-row', 'd-flex-align-center', cx('fr-my-2w'))}
      >
        <h3>Configuration Sacha</h3>
        <Button
          priority="secondary"
          iconId="fr-icon-upload-line"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={cx('fr-ml-auto')}
        >
          {isLoading ? 'Import en cours...' : 'Importer un référentiel'}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,application/xml,text/xml"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {(isError || isSuccess) && (
        <Alert
          severity={isError ? 'error' : 'success'}
          title={isError ? 'Erreur' : 'Succès'}
          description={
            isError
              ? "L'import du fichier XML a échoué."
              : "L'import du fichier XML a réussi."
          }
          small
          className="fr-my-2w"
          closable={true}
        />
      )}
    </>
  );
};

import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
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
      <Button
        priority="secondary"
        iconId="fr-icon-upload-line"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="fr-my-2w"
      >
        {isLoading
          ? 'Import en cours...'
          : 'Importer un nouveau référentiel des commémoratifs'}
      </Button>
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
        />
      )}
    </>
  );
};

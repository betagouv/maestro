import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { type ChangeEvent, useContext, useRef } from 'react';
import { assert, type Equals } from 'tsafe';
import AppServiceErrorAlert from '../../../components/_app/AppErrorAlert/AppServiceErrorAlert';
import { ApiClientContext } from '../../../services/apiClient';

const ReferentialKindLabels = {
  DS01: 'Données standardisées (DS01)',
  RP01: 'Référentiel prescripteur (RP01)'
} as const;

type Props = Record<never, never>;

export const SachaReferentialUpload = ({ ..._rest }: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const { useUpdateSachaReferentialMutation } = useContext(ApiClientContext);

  const [updateSachaReferential, importCall] =
    useUpdateSachaReferentialMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const xmlContent = await file.text();
      await updateSachaReferential({ xmlContent });
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
        disabled={importCall.isLoading}
        className={cx('fr-ml-auto')}
      >
        {importCall.isLoading
          ? 'Import en cours...'
          : 'Importer un référentiel Sacha (DS01 ou RP01)'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,application/xml,text/xml"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <AppServiceErrorAlert call={importCall} />
      {importCall.isSuccess && importCall.data && (
        <Alert
          severity="success"
          title="Succès"
          description={`${ReferentialKindLabels[importCall.data.kind]} importé : ${importCall.data.fileName}.`}
          small
          className="fr-my-2w"
          closable={true}
        />
      )}
    </>
  );
};

import Alert from '@codegouvfr/react-dsfr/Alert';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Upload } from '@codegouvfr/react-dsfr/Upload';
import {
  isSupportedPrescriptionImportFile,
  PrescriptionImportExtensions,
  type PrescriptionImportResult
} from 'maestro-shared/schema/Prescription/PrescriptionImport';
import { useContext, useState } from 'react';
import { ApiClientContext } from 'src/services/apiClient';

export const prescriptionImportModal = createModal({
  id: 'prescription-import-modal',
  isOpenedByDefault: false
});

interface Props {
  year: number;
  onImported: (result: PrescriptionImportResult) => void;
}

const PrescriptionImportModal = ({ year, onImported }: Props) => {
  const apiClient = useContext(ApiClientContext);
  const [importPrescriptions] = apiClient.useImportPrescriptionsMutation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const reset = () => {
    setFile(null);
    setError(null);
    setIsImporting(false);
  };

  const submit = async () => {
    if (!file) {
      return;
    }
    setIsImporting(true);
    setError(null);
    try {
      const content = await file.arrayBuffer().then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) {
          binary += String.fromCharCode(byte);
        }
        return btoa(binary);
      });

      const result = await importPrescriptions({
        filename: file.name,
        content,
        year
      }).unwrap();

      prescriptionImportModal.close();
      reset();
      onImported(result);
    } catch {
      setError(
        "Le fichier n'a pas pu être importé. Vérifiez son format et réessayez."
      );
      setIsImporting(false);
    }
  };

  return (
    <prescriptionImportModal.Component
      title="Importer un fichier de programmation"
      buttons={[
        {
          children: 'Annuler',
          priority: 'secondary',
          onClick: reset
        },
        {
          children: 'Importer',
          doClosesModal: false,
          disabled: !file || isImporting,
          onClick: submit
        }
      ]}
    >
      <Alert
        severity="info"
        small
        description="Seuls les volumes de prélèvements des sous-plans existants sur Maestro seront importés."
        className={cx('fr-mb-2w')}
      />
      <Upload
        label="Fichier de programmation"
        hint={`Formats acceptés : ${PrescriptionImportExtensions.join(', ')}`}
        nativeInputProps={{
          accept: PrescriptionImportExtensions.map((_) => `.${_}`).join(','),
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.files?.[0] ?? null;
            if (selected && !isSupportedPrescriptionImportFile(selected.name)) {
              setFile(null);
              setError(
                `Format non supporté. Utilisez un fichier ${PrescriptionImportExtensions.join(', ')}.`
              );
              return;
            }
            setError(null);
            setFile(selected);
          }
        }}
        state={error ? 'error' : 'default'}
        stateRelatedMessage={error ?? undefined}
      />
    </prescriptionImportModal.Component>
  );
};

export default PrescriptionImportModal;

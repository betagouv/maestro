import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { FileInput } from 'maestro-shared/schema/File/FileInput';
import type {
  ProgrammingLevelSettingsForm,
  ProgrammingPlanTechnicalInstruction
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import {
  type ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { defaultAppSelectOption } from 'src/components/_app/AppSelect/AppSelectOption';
import AppUpload from 'src/components/_app/AppUpload/AppUpload';
import type { UseForm } from 'src/hooks/useForm';
import { ApiClientContext } from 'src/services/apiClient';
import { getDocumentDownloadURL } from 'src/services/document.service';
import { assert, type Equals } from 'tsafe';

type Props = {
  technicalInstruction: ProgrammingPlanTechnicalInstruction | null;
  technicalInstructionFile: File | undefined;
  inputForm: UseForm<typeof ProgrammingLevelSettingsForm>;
  onChange: (
    technicalInstruction: ProgrammingPlanTechnicalInstruction | null
  ) => void;
  onFileChange: (file: File | undefined) => void;
};

export const ProgrammingPlanDocuments = ({
  technicalInstruction,
  technicalInstructionFile,
  inputForm,
  onChange,
  onFileChange,
  ..._rest
}: Props) => {
  assert<Equals<keyof typeof _rest, never>>();

  const apiClient = useContext(ApiClientContext);

  const { data: resources = [] } = apiClient.useFindResourcesQuery({});
  const technicalInstructions = resources.filter(
    ({ kind }) => kind === 'TechnicalInstruction'
  );

  const [fileError, setFileError] = useState<string>();

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const result = FileInput().safeParse(event.target.files?.[0] ?? null);
    setFileError(result.success ? undefined : result.error.issues[0].message);
    onFileChange(result.success ? result.data : undefined);
  };

  const selectTechnicalInstruction = (documentId: string) => {
    const document = technicalInstructions.find(({ id }) => id === documentId);
    onChange(
      document ? { id: document.id, filename: document.filename } : null
    );
  };

  const fileUrl = useMemo(
    () =>
      technicalInstructionFile && URL.createObjectURL(technicalInstructionFile),
    [technicalInstructionFile]
  );

  useEffect(
    () => () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    },
    [fileUrl]
  );

  const current = technicalInstructionFile
    ? { label: technicalInstructionFile.name, href: fileUrl }
    : technicalInstruction && {
        label:
          technicalInstructions.find(({ id }) => id === technicalInstruction.id)
            ?.name ?? technicalInstruction.filename,
        href: getDocumentDownloadURL(technicalInstruction.id, {
          type: 'resource'
        })
      };

  const remove = () => {
    onFileChange(undefined);
    onChange(null);
  };

  return (
    <div className={clsx('border', cx('fr-p-2w'))}>
      <h6 className={cx('fr-mb-2w')}>Documents</h6>
      {current ? (
        <div className="d-flex-align-center">
          <span className={cx('fr-mr-1w')}>Instruction technique :</span>
          <a
            href={current.href}
            target="_blank"
            rel="noreferrer"
            className={cx('fr-link')}
          >
            {current.label}
          </a>
          <Button
            title="Supprimer l’instruction technique"
            iconId="fr-icon-delete-line"
            priority="tertiary no outline"
            size="small"
            onClick={remove}
          />
        </div>
      ) : (
        <>
          <AppSelect
            label="Instruction technique"
            value=""
            options={[
              defaultAppSelectOption('Choisir une instruction technique'),
              ...technicalInstructions.map(({ id, name, filename }) => ({
                label: name ?? filename,
                value: id
              }))
            ]}
            onChange={(e) => selectTechnicalInstruction(e.target.value)}
            inputForm={inputForm}
            inputKey="technicalInstruction"
          />
          <AppUpload
            label=""
            buttonLabel="Parcourir"
            nativeInputProps={{ onChange: selectFile }}
            inputForm={inputForm}
            inputKey="technicalInstruction"
            state={fileError ? 'error' : undefined}
            stateRelatedMessage={fileError}
          />
        </>
      )}
    </div>
  );
};

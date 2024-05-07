import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useState } from 'react';
import { MatrixList } from 'shared/foodex2/Matrix';
import { Sample } from 'shared/schema/Sample/Sample';
import { SampleStage, SampleStageList } from 'shared/schema/Sample/SampleStage';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useForm } from 'src/hooks/useForm';
interface AddMatrixProps {
  excludedList: { matrix: string; stage: SampleStage }[];
  onAddMatrix: (matrix: string, stage: SampleStage) => Promise<void>;
}

const addModal = createModal({
  id: 'add-modal',
  isOpenedByDefault: false,
});

const AddMatrix = ({ excludedList, onAddMatrix }: AddMatrixProps) => {
  useIsModalOpen(addModal, {
    onConceal: () => {
      setMatrix(undefined);
      setStage(undefined);
      form.reset();
    },
  });

  const [matrix, setMatrix] = useState<string>();
  const [stage, setStage] = useState<SampleStage>();

  const Form = Sample.pick({
    matrix: true,
    stage: true,
  });

  const FormRefinement = Form.refine(
    ({ matrix, stage }) =>
      !excludedList.find(
        (excluded) => excluded.matrix === matrix && excluded.stage === stage
      ),
    {
      path: ['existingMatrix'],
      message: 'Cette matrice a déjà été ajoutée.',
    }
  );

  const form = useForm(FormRefinement, {
    matrix,
    stage,
    existingMatrix: false,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      FormRefinement.safeParse({ matrix, stage });

      await onAddMatrix(matrix!, stage!);
      addModal.close();
    });
  };

  return (
    <>
      <Button
        title="Ajouter"
        iconId="fr-icon-add-circle-line"
        priority="tertiary no outline"
        className="cell-icon"
        onClick={addModal.open}
        data-testid="add-matrix-button"
      />
      <addModal.Component
        title="Ajouter une matrice"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
          },
          {
            children: 'Ajouter',
            onClick: submit,
            doClosesModal: false,
          },
        ]}
      >
        <form data-testid="add_matrix_form">
          <AppSelect<FormShape>
            value={matrix ?? ''}
            options={selectOptionsFromList(MatrixList)}
            onChange={(e) => setMatrix(e.target.value as string)}
            inputForm={form}
            inputKey="matrix"
            whenValid="Matrice correctement renseignée."
            data-testid="matrix-select"
            label="Matrice (obligatoire)"
            required
          />
          <AppSelect<FormShape>
            value={stage ?? ''}
            options={selectOptionsFromList(SampleStageList)}
            onChange={(e) => setStage(e.target.value as SampleStage)}
            inputForm={form}
            inputKey="stage"
            whenValid="Stade de prélèvement correctement renseigné."
            data-testid="stage-select"
            label="Stade de prélèvement (obligatoire)"
            required
          />
        </form>
        {form.hasIssue('existingMatrix') && (
          <Alert
            severity="error"
            description={form.message('existingMatrix') as string}
            small
            className={cx('fr-mt-4w')}
          />
        )}
      </addModal.Component>
    </>
  );
};

export default AddMatrix;

import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { useIsModalOpen } from '@codegouvfr/react-dsfr/Modal/useIsModalOpen';
import { useState } from 'react';
import { Matrix } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import { MatrixListByKind } from 'shared/referential/Matrix/MatrixList';
import {
  MatrixKind,
  MatrixKindLabels,
  MatrixKindList,
} from 'shared/referential/MatrixKind';
import { Stage, StageLabels, StageList } from 'shared/referential/Stage';
import { Prescription } from 'shared/schema/Prescription/Prescription';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import { useForm } from 'src/hooks/useForm';
import { z } from 'zod';
interface AddMatrixProps {
  excludedList: { matrix: Matrix; stage: Stage }[];
  onSelect: (matrix: Matrix, stage: Stage) => Promise<void>;
  buttonTitle?: string;
}

const matrixSelectModal = createModal({
  id: 'matrix-select-modal',
  isOpenedByDefault: false,
});

const MatrixSelectModal = ({
  excludedList,
  onSelect,
  buttonTitle,
}: AddMatrixProps) => {
  useIsModalOpen(matrixSelectModal, {
    onConceal: () => {
      setMatrix(undefined);
      setStage(undefined);
      form.reset();
    },
  });

  const isOpen = useIsModalOpen(matrixSelectModal);
  const [matrixKind, setMatrixKind] = useState<MatrixKind>();
  const [matrix, setMatrix] = useState<Matrix>();
  const [stage, setStage] = useState<Stage>();

  const Form = Prescription.pick({
    sampleMatrix: true,
    sampleStage: true,
  }).merge(
    z.object({
      sampleMatrixKind: MatrixKind,
    })
  );

  const FormRefinement = Form.refine(
    ({ sampleMatrix, sampleStage }) =>
      !excludedList.find(
        (excluded) =>
          excluded.matrix === sampleMatrix && excluded.stage === sampleStage
      ),
    {
      path: ['existingMatrix'],
      message: 'Cette matrice a déjà été ajoutée.',
    }
  );

  const form = useForm(FormRefinement, {
    sampleMatrix: matrix,
    sampleMatrixKind: matrixKind,
    sampleStage: stage,
    existingMatrix: false,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      FormRefinement.safeParse({ matrix, stage });

      await onSelect(matrix!, stage!);
      matrixSelectModal.close();
    });
  };

  return (
    <>
      <Button
        title="Ajouter"
        iconId="fr-icon-add-circle-line"
        priority="tertiary no outline"
        className="cell-icon"
        onClick={matrixSelectModal.open}
        data-testid="add-matrix-button"
      >
        {buttonTitle}
      </Button>
      <matrixSelectModal.Component
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
        {isOpen && (
          <form data-testid="add_matrix_form">
            <AppSelect<FormShape>
              value={matrixKind ?? ''}
              options={selectOptionsFromList(MatrixKindList, {
                labels: MatrixKindLabels,
              })}
              onChange={(e) => {
                setMatrix(undefined);
                setMatrixKind(e.target.value as MatrixKind);
              }}
              inputForm={form}
              inputKey="sampleMatrixKind"
              whenValid="Catégorie de matrice correctement renseignée."
              data-testid="matrixkind-select"
              label="Catégorie de matrice (obligatoire)"
              required
            />
            <AppSelect<FormShape>
              value={matrix ?? ''}
              options={
                matrixKind
                  ? selectOptionsFromList(MatrixListByKind[matrixKind], {
                      labels: MatrixLabels,
                    })
                  : []
              }
              onChange={(e) => setMatrix(e.target.value as Matrix)}
              inputForm={form}
              inputKey="sampleMatrix"
              whenValid="Matrice correctement renseignée."
              data-testid="matrix-select"
              label="Matrice (obligatoire)"
              required
            />
            <AppSelect<FormShape>
              value={stage ?? ''}
              options={selectOptionsFromList(StageList, {
                labels: StageLabels,
              })}
              onChange={(e) => setStage(e.target.value as Stage)}
              inputForm={form}
              inputKey="sampleStage"
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement (obligatoire)"
              required
            />
          </form>
        )}
        {form.hasIssue('existingMatrix') && (
          <Alert
            severity="error"
            description={form.message('existingMatrix') as string}
            small
            className={cx('fr-mt-4w')}
          />
        )}
      </matrixSelectModal.Component>
    </>
  );
};

export default MatrixSelectModal;

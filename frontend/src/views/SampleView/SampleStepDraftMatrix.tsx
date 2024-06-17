import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CultureKind,
  CultureKindLabels,
  CultureKindList,
} from 'shared/referential/CultureKind';
import { Matrix, MatrixList } from 'shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'shared/referential/Matrix/MatrixLabels';
import {
  MatrixPart,
  MatrixPartLabels,
  MatrixPartList,
} from 'shared/referential/MatrixPart';
import { Stage, StageLabels, StageList } from 'shared/referential/Stage';
import { PartialSample, Sample } from 'shared/schema/Sample/Sample';
import AppRequiredText from 'src/components/_app/AppRequired/AppRequiredText';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextAreaInput from 'src/components/_app/AppTextAreaInput/AppTextAreaInput';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { useFindPrescriptionsQuery } from 'src/services/prescription.service';
import { useUpdateSampleMutation } from 'src/services/sample.service';

interface Props {
  partialSample: PartialSample;
}

const SampleStepDraftMatrix = ({ partialSample }: Props) => {
  const navigate = useNavigate();

  const [matrix, setMatrix] = useState(partialSample.matrix);
  const [matrixDetails, setMatrixDetails] = useState(
    partialSample.matrixDetails
  );
  const [matrixPart, setMatrixPart] = useState(partialSample.matrixPart);
  const [stage, setStage] = useState(partialSample.stage);
  const [cultureKind, setCultureKind] = useState(partialSample.cultureKind);
  const [releaseControl, setReleaseControl] = useState(
    partialSample.releaseControl
  );
  const [commentInfos, setCommentInfos] = useState(partialSample.commentInfos);

  const [updateSample] = useUpdateSampleMutation();

  const { data: prescriptions } = useFindPrescriptionsQuery(
    { programmingPlanId: partialSample.programmingPlanId as string },
    {
      skip: !partialSample.programmingPlanId,
    }
  );

  const Form = Sample.pick({
    matrix: true,
    matrixDetails: true,
    matrixPart: true,
    stage: true,
    cultureKind: true,
    releaseControl: true,
    temperatureMaintenance: true,
    commentInfos: true,
    status: true,
  });

  const form = useForm(Form, {
    matrix,
    matrixDetails,
    matrixPart,
    stage,
    cultureKind,
    releaseControl,
    commentInfos,
    status: partialSample.status,
  });

  type FormShape = typeof Form.shape;

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async () => {
      await save('DraftItems');
      navigate(`/prelevements/${partialSample.id}?etape=4`, {
        replace: true,
      });
    });
  };

  const save = async (status = partialSample.status) => {
    const prescription = prescriptions?.find(
      (p) => matrix && stage && p.matrix === matrix && p.stages.includes(stage)
    );
    await updateSample({
      ...partialSample,
      matrixDetails,
      matrix,
      matrixPart,
      stage,
      cultureKind,
      releaseControl,
      commentInfos,
      status,
      laboratoryId: prescription?.laboratoryId ?? partialSample.laboratoryId,
    });
  };

  return (
    <>
      <form
        data-testid="draft_sample_infos_form"
        onChange={async (e) => {
          e.preventDefault();
          await save();
        }}
        className="sample-form"
      >
        <AppRequiredText />
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              value={matrix ?? ''}
              options={selectOptionsFromList(
                MatrixList.filter(
                  (matrix) =>
                    !prescriptions ||
                    prescriptions.find((p) => p.matrix === matrix)
                ),
                {
                  labels: MatrixLabels,
                }
              )}
              onChange={(e) => setMatrix(e.target.value as Matrix)}
              inputForm={form}
              inputKey="matrix"
              whenValid="Matrice correctement renseignée."
              data-testid="matrix-select"
              label="Matrice"
              required
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              defaultValue={stage ?? ''}
              options={selectOptionsFromList(
                StageList.filter(
                  (stage) =>
                    !prescriptions ||
                    prescriptions.find(
                      (p) => p.matrix === matrix && p.stages.includes(stage)
                    )
                ),
                {
                  labels: StageLabels,
                }
              )}
              onChange={(e) => setStage(e.target.value as Stage)}
              inputForm={form}
              inputKey="stage"
              whenValid="Stade de prélèvement correctement renseigné."
              data-testid="stage-select"
              label="Stade de prélèvement"
              required
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextInput<FormShape>
              defaultValue={matrixDetails ?? ''}
              onChange={(e) => setMatrixDetails(e.target.value)}
              inputForm={form}
              inputKey="matrixDetails"
              whenValid="Détail de la matrice correctement renseigné."
              data-testid="matrixdetails-input"
              label="Détail de la matrice"
              hintText="Champ facultatif pour précisions supplémentaires"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              defaultValue={cultureKind ?? ''}
              options={selectOptionsFromList(CultureKindList, {
                labels: CultureKindLabels,
              })}
              onChange={(e) => setCultureKind(e.target.value as CultureKind)}
              inputForm={form}
              inputKey="cultureKind"
              whenValid="Type de culture correctement renseigné."
              data-testid="culturekind-select"
              label="Type de culture"
            />
          </div>
          <div className={cx('fr-col-12', 'fr-col-sm-6')}>
            <AppSelect<FormShape>
              defaultValue={matrixPart ?? ''}
              options={selectOptionsFromList(MatrixPartList, {
                labels: MatrixPartLabels,
              })}
              onChange={(e) => setMatrixPart(e.target.value as MatrixPart)}
              inputForm={form}
              inputKey="matrixPart"
              whenValid="Partie du végétal correctement renseignée."
              data-testid="matrixpart-select"
              label="Partie du végétal"
              required
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <ToggleSwitch
              label="Contrôle libératoire"
              checked={releaseControl ?? false}
              onChange={(checked) => setReleaseControl(checked)}
              showCheckedHint={false}
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppTextAreaInput<FormShape>
              rows={1}
              defaultValue={commentInfos ?? ''}
              onChange={(e) => setCommentInfos(e.target.value)}
              inputForm={form}
              inputKey="commentInfos"
              whenValid="Note correctement renseignée."
              data-testid="comment-input"
              label="Note additionnelle"
              hintText="Champ facultatif pour précisions supplémentaires"
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <hr className={cx('fr-mx-0')} />
            <ButtonsGroup
              alignment="between"
              inlineLayoutWhen="md and up"
              buttons={[
                {
                  title: 'Etape précédente',
                  iconId: 'fr-icon-arrow-left-line',
                  priority: 'tertiary',
                  onClick: async (e) => {
                    e.preventDefault();
                    await save('Draft');
                    navigate(`/prelevements/${partialSample.id}?etape=2`, {
                      replace: true,
                    });
                  },
                  nativeButtonProps: {
                    'data-testid': 'previous-button',
                  },
                },
                {
                  children: 'Enregistrer en brouillon',
                  iconId: 'fr-icon-save-line',
                  priority: 'tertiary',
                  onClick: async (e) => {
                    e.preventDefault();
                    await save();
                  },
                },
                {
                  children: 'Continuer',
                  onClick: submit,
                  iconId: 'fr-icon-arrow-right-line',
                  iconPosition: 'right',
                  nativeButtonProps: {
                    'data-testid': 'submit-button',
                  },
                },
              ]}
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default SampleStepDraftMatrix;

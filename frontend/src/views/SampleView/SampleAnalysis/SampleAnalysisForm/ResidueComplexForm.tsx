import Badge from '@codegouvfr/react-dsfr/Badge';
import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { Analyte } from 'maestro-shared/referential/Residue/Analyte';
import { getAnalytes } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { PartialAnalyte } from 'maestro-shared/schema/Analysis/Analyte';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResultKind,
  ResultKindLabels,
  ResultKindList
} from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import AppSearchInput from 'src/components/_app/AppSearchInput/AppSearchInput';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { UseForm } from '../../../../hooks/useForm';
import ResidueSimpleForm from './ResidueSimpleForm';
import { ResiduesLmrValidator } from './SampleAnalysisForm';

interface Props {
  form: UseForm<ResiduesLmrValidator>;
  residue: Omit<PartialResidue, 'reference'>;
  residueIndex: number;
  residueReference: SSD2Id;
  changeResidue: (residue: Props['residue'], residueIndex: number) => void;
}

function ResidueComplexForm({
  form,
  residue,
  residueIndex,
  changeResidue,
  residueReference
}: Props) {
  const changeAnalyte = (analyte: PartialAnalyte, analyteIndex: number) => {
    const newAnalytes = [...(residue.analytes ?? [])];
    newAnalytes[analyteIndex] = analyte;
    changeResidue({ ...residue, analytes: newAnalytes }, residueIndex);
  };

  const addAnalyte = () => {
    const newAnalytes = [...(residue.analytes ?? [])];
    newAnalytes.push({
      analysisId: residue.analysisId,
      residueNumber: residue.residueNumber,
      analyteNumber: newAnalytes.length + 1
    });
    changeResidue({ ...residue, analytes: newAnalytes }, residueIndex);
  };

  const removeAnalyte = (analyteIndex: number) => {
    changeResidue(
      {
        ...residue,
        analytes: residue.analytes?.filter((_, index) => index !== analyteIndex)
      },
      residueIndex
    );
  };

  return (
    <>
      {residue.analytes?.map((analyte, analyteIndex) => (
        <div key={`analyte-${analyteIndex}`}>
          <div className={clsx(cx('fr-mb-2w'), 'd-flex-align-center')}>
            <Badge severity="warning" noIcon>
              Analyte n°{analyteIndex + 1} du résidu complexe
            </Badge>
            <div className="border-middle"></div>
            {(residue.analytes?.length ?? 0) > 1 && (
              <Button
                iconId="fr-icon-delete-line"
                onClick={() => removeAnalyte(analyteIndex)}
                size="small"
                priority="secondary"
                title={`Supprimer l'analyte n°${analyteIndex + 1}`}
                className={cx('fr-mt-0')}
              />
            )}
          </div>
          <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
            <div className={cx('fr-col-12')}>
              <AppSearchInput
                options={selectOptionsFromList(
                  Array.from(getAnalytes(residueReference)),
                  {
                    labels: SSD2IdLabel,
                    withSort: true,
                    withDefault: false
                  }
                )}
                value={analyte.reference ?? ''}
                state={form.messageType('residues', [
                  residueIndex,
                  'analytes',
                  analyteIndex,
                  'reference'
                ])}
                stateRelatedMessage={form.message('residues', [
                  residueIndex,
                  'analytes',
                  analyteIndex,
                  'reference'
                ])}
                onSelect={(value) =>
                  changeAnalyte(
                    { ...analyte, reference: value as Analyte },
                    analyteIndex
                  )
                }
                label="Analyte"
                whenValid={`Analyte correctement renseigné`}
                required
              />
            </div>
            <div className={cx('fr-col-6')}>
              <AppSelect
                value={analyte.resultKind ?? ''}
                options={selectOptionsFromList(ResultKindList, {
                  labels: ResultKindLabels
                })}
                onChange={(e) =>
                  changeAnalyte(
                    {
                      ...analyte,
                      resultKind: e.target.value as ResultKind,
                      result: undefined
                    },
                    analyteIndex
                  )
                }
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[
                  residueIndex,
                  'analytes',
                  analyteIndex,
                  'resultKind'
                ]}
                whenValid="Type de résultat correctement renseigné"
                label="Type de résultat de l'analyse"
                hint="Sélectionnez le type de résultat"
                required
              />
            </div>
            {analyte.resultKind === 'Q' && (
              <>
                <div className={cx('fr-col-6')}>
                  <AppTextInput
                    value={analyte.result ?? ''}
                    onChange={(e) =>
                      changeAnalyte(
                        {
                          ...analyte,
                          result: e.target.value ? Number(e.target.value) : null
                        },
                        analyteIndex
                      )
                    }
                    type="number"
                    inputForm={form}
                    inputKey="residues"
                    inputPathFromKey={[
                      residueIndex,
                      'analytes',
                      analyteIndex,
                      'result'
                    ]}
                    whenValid="Valeur correctement renseignée"
                    label="Valeur numérique du résultat"
                    hintText="En mg/kg"
                    min={0}
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      <div className="d-flex-align-center">
        <Button
          iconId="fr-icon-add-line"
          onClick={addAnalyte}
          size="small"
          priority="secondary"
        >
          Ajouter un analyte
        </Button>
        <div className={clsx('border-middle', cx('fr-my-0'))}></div>
      </div>
      <h6 className={cx('fr-mb-0')}>
        <span
          className={clsx(
            cx('fr-icon-chat-poll-fill', 'fr-mr-1w'),
            'icon-grey'
          )}
        ></span>
        Somme des analytes
      </h6>
      <ResidueSimpleForm
        form={form}
        residue={residue}
        residueIndex={residueIndex}
        changeResidue={changeResidue}
      />
    </>
  );
}

export default ResidueComplexForm;

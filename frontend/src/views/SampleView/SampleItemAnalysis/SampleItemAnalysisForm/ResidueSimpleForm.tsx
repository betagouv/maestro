import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  LmrIsValid,
  PartialResidue,
  ResidueLmrChecked
} from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResultKind,
  ResultKindLabels,
  ResultKindList
} from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import ResidueResultAlert from 'src/components/ResidueResultAlert/ResidueResultAlert';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { UseForm } from '../../../../hooks/useForm';
import { ResiduesLmrValidator } from './SampleAnalysisForm';

interface Props {
  form: UseForm<ResiduesLmrValidator>;
  residue: PartialResidue;
  residueIndex: number;
  changeResidue: (residue: PartialResidue, residueIndex: number) => void;
}

function ResidueSimpleForm({
  form,
  residue,
  residueIndex,
  changeResidue
}: Props) {
  return (
    <>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppSelect
            value={residue.resultKind ?? ''}
            options={selectOptionsFromList(ResultKindList, {
              labels: ResultKindLabels
            })}
            onChange={(e) =>
              changeResidue(
                {
                  ...residue,
                  resultKind: e.target.value as ResultKind,
                  result: undefined,
                  lmr: undefined
                },
                residueIndex
              )
            }
            inputForm={form}
            inputKey="residues"
            inputPathFromKey={[residueIndex, 'resultKind']}
            whenValid="Type de résultat correctement renseigné"
            label="Type de résultat de l'analyse"
            required
          />
        </div>
        {residue.resultKind === 'Q' && (
          <>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              <AppTextInput
                value={residue.result ?? ''}
                onChange={(e) =>
                  changeResidue(
                    {
                      ...residue,
                      result: e.target.value ? Number(e.target.value) : null
                    },
                    residueIndex
                  )
                }
                type="number"
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'result']}
                whenValid="Valeur correctement renseignée"
                label="Valeur numérique du résultat"
                hintText="En mg/kg"
                min={0}
                required
              />
            </div>
            <div className={cx('fr-col-12', 'fr-col-sm-6')}>
              <AppTextInput
                value={residue.lmr ?? ''}
                onChange={(e) =>
                  changeResidue(
                    {
                      ...residue,
                      lmr: e.target.value ? Number(e.target.value) : null
                    },
                    residueIndex
                  )
                }
                type="number"
                inputForm={form}
                inputKey="residues"
                inputPathFromKey={[residueIndex, 'lmr']}
                whenValid="Valeur correctement renseignée"
                label="Valeur de la LMR"
                hintText="En mg/kg"
                min={0}
                required={
                  !LmrIsValid({
                    ...(form.input.residues as ResidueLmrChecked[])[
                      residueIndex
                    ],
                    lmr: null
                  })
                }
              />
            </div>
            {isDefinedAndNotNull(residue.result) &&
              isDefinedAndNotNull(residue.lmr) && (
                <div className={cx('fr-col-12')}>
                  <ResidueResultAlert
                    result={residue.result}
                    lmr={residue.lmr}
                  />
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
}

export default ResidueSimpleForm;

import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  SimpleResidue,
  SimpleResidueList,
} from 'maestro-shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from 'maestro-shared/referential/Residue/SimpleResidueLabels';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import {
  ResultKind,
  ResultKindLabels,
  ResultKindList,
} from 'maestro-shared/schema/Analysis/Residue/ResultKind';
import { isDefinedAndNotNull } from 'maestro-shared/utils/utils';
import ResidueResultAlert from 'src/components/ResidueResultAlert/ResidueResultAlert';
import AppSearchInput from 'src/components/_app/AppSearchInput/AppSearchInput';
import AppSelect from 'src/components/_app/AppSelect/AppSelect';
import { selectOptionsFromList } from 'src/components/_app/AppSelect/AppSelectOption';
import AppTextInput from 'src/components/_app/AppTextInput/AppTextInput';
import { useForm } from 'src/hooks/useForm';
import { ZodRawShape } from 'zod';

interface Props {
  form: ReturnType<typeof useForm>;
  residue: PartialResidue;
  residueIndex: number;
  changeResidue: (residue: PartialResidue, residueIndex: number) => void;
}

function SimpleResidueForm<T extends ZodRawShape>({
  form,
  residue,
  residueIndex,
  changeResidue,
}: Props) {
  return (
    <>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppSearchInput
            options={selectOptionsFromList(SimpleResidueList, {
              labels: SimpleResidueLabels,
              withSort: true,
              withDefault: false,
            })}
            value={residue.reference ?? ''}
            state={form.messageType('residues', [residueIndex, 'reference'])}
            stateRelatedMessage={form.message('residues', [
              residueIndex,
              'reference',
            ])}
            onSelect={(value) =>
              changeResidue(
                {
                  ...residue,
                  reference: value as SimpleResidue,
                },
                residueIndex
              )
            }
            label="Résidu selon définition"
            whenValid={`Résidu correctement renseigné`}
            required
          />
        </div>
      </div>
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <AppSelect<T>
            value={residue.resultKind ?? ''}
            options={selectOptionsFromList(ResultKindList, {
              labels: ResultKindLabels,
            })}
            onChange={(e) =>
              changeResidue(
                {
                  ...residue,
                  resultKind: e.target.value as ResultKind,
                  result: undefined,
                  lmr: undefined,
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
              <AppTextInput<T>
                value={residue.result ?? ''}
                onChange={(e) =>
                  changeResidue(
                    { ...residue, result: Number(e.target.value) },
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
              <AppTextInput<T>
                value={residue.lmr ?? ''}
                onChange={(e) =>
                  changeResidue(
                    { ...residue, lmr: Number(e.target.value) },
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
                required
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

export default SimpleResidueForm;

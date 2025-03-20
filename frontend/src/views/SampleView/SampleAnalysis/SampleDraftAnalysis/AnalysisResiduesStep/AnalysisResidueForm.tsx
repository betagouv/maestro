import React, { FunctionComponent } from 'react';
import { assert, type Equals } from 'tsafe';
import clsx from 'clsx';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import Button from '@codegouvfr/react-dsfr/Button';
import AppRadioButtons from '../../../../../components/_app/AppRadioButtons/AppRadioButtons';
import { selectOptionsFromList } from '../../../../../components/_app/AppSelect/AppSelectOption';
import {
  AnalysisMethod,
  AnalysisMethodLabels,
  AnalysisMethodList
} from 'maestro-shared/schema/Analysis/AnalysisMethod';
import { type PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { UseForm } from '../../../../../hooks/useForm';
import { Analysis } from 'maestro-shared/schema/Analysis/Analysis';
import { ResidueKind } from 'maestro-shared/schema/Analysis/Residue/ResidueKind';
import { isComplex } from 'maestro-shared/referential/Residue/SSD2Hierachy';
import SimpleResidueForm from './SimpleResidueForm';
import ComplexResidueForm from './ComplexResidueForm';
import { ResidueInterpretationForm } from './ResidueInterpretationForm';
import AppSearchInput from '../../../../../components/_app/AppSearchInput/AppSearchInput';
import { SSD2IdLabel } from 'maestro-shared/referential/Residue/SSD2Referential';
import { SSD2Id, SSD2Ids } from 'maestro-shared/referential/Residue/SSD2Id';

const _validator = Analysis.pick({ residues: true });
export type Props = {
  residueIndex: number;
  residue: PartialResidue;
  form: UseForm<typeof _validator>;
  onDeleteResidue: () => void;
  changeResidue: (residue: PartialResidue, residueIndex: number) => void;
};
export const AnalysisResidueForm: FunctionComponent<Props> = ({
  residueIndex,
  residue,
  onDeleteResidue,
  changeResidue,
  form,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const kind: ResidueKind =
    residue.reference && isComplex(residue.reference) ? 'Complex' : 'Simple';

  return (
    <>
      <div
        className={clsx(cx('fr-icon-microscope-line', 'fr-mr-1w'), 'icon-grey')}
      ></div>
      <div className={clsx(cx('fr-px-0'), 'residue-form')}>
        <h5>
          <div>Résidu n°{residueIndex + 1}</div>
          {residueIndex > 0 && (
            <>
              <div className="border-middle"></div>
              <Button
                title="Supprimer"
                iconId="fr-icon-delete-line"
                priority="tertiary"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteResidue();
                }}
                className={cx('fr-mt-0')}
              />
            </>
          )}
        </h5>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppRadioButtons
              legend="Méthode d’analyse"
              options={selectOptionsFromList(AnalysisMethodList, {
                labels: AnalysisMethodLabels,
                withDefault: false
              }).map(({ label, value }) => ({
                key: `residue-${residueIndex}-analysisMethod-option-${value}`,
                label,
                nativeInputProps: {
                  checked: residue.analysisMethod === value,
                  onChange: () =>
                    changeResidue(
                      {
                        ...residue,
                        analysisMethod: value as AnalysisMethod
                      },
                      residueIndex
                    )
                }
              }))}
              colSm={6}
              inputForm={form}
              inputKey="residues"
              inputPathFromKey={[residueIndex, 'analysisMethod']}
              whenValid="Méthode d’analyse correctement renseignée"
              required
            />
          </div>
        </div>
        <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={cx('fr-col-12')}>
            <AppSearchInput
              options={selectOptionsFromList([...SSD2Ids], {
                labels: SSD2IdLabel,
                withSort: true,
                withDefault: false
              })}
              value={residue.reference ?? ''}
              state={form.messageType('residues', [residueIndex, 'reference'])}
              stateRelatedMessage={form.message('residues', [
                residueIndex,
                'reference'
              ])}
              onSelect={(value) =>
                changeResidue(
                  {
                    ...residue,
                    reference: value as SSD2Id
                  },
                  residueIndex
                )
              }
              label="Résidu"
              whenValid={`Résidu correctement renseigné`}
              required
            />
          </div>
        </div>
        {residue.reference !== undefined ? (
          <>
            {kind === 'Simple' && (
              <SimpleResidueForm
                form={form}
                residue={residue}
                residueIndex={residueIndex}
                changeResidue={changeResidue}
              />
            )}
            {kind === 'Complex'  && (
              <ComplexResidueForm
                form={form}
                residue={residue}
                residueReference={residue.reference}
                residueIndex={residueIndex}
                changeResidue={changeResidue}
              />
            )}
            {kind && (
              <>
                <hr />
                <ResidueInterpretationForm
                  form={form}
                  onChangeResidue={changeResidue}
                  residue={residue}
                  residueIndex={residueIndex}
                />
              </>
            )}{' '}
          </>
        ) : null}
      </div>
    </>
  );
};
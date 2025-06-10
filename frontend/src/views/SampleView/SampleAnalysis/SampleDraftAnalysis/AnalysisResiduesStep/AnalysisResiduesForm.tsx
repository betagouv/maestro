import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import React, { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { useForm } from '../../../../../hooks/useForm';
import { AnalysisResidueForm } from './AnalysisResidueForm';

type Props = {
  partialAnalysis: Pick<PartialAnalysis, 'id' | 'residues'>;
  onBack: () => Promise<void>;
  onValidate: (residues: Analysis['residues']) => Promise<void>;
};

const analysisResiduesValidator = Analysis.pick({ residues: true });
export type Form = typeof analysisResiduesValidator;

export const useResiduesForm = (
  partialAnalysis: Pick<PartialAnalysis, 'residues'>
) => {
  const [residues, setResidues] = useState(partialAnalysis.residues ?? []);

  const changeResidue = (residue: PartialResidue, index: number) => {
    const newResidues = [...residues];
    newResidues[index] = residue;
    setResidues(newResidues);
  };

  const form = useForm(analysisResiduesValidator, {
    residues
  });

  return {
    residues,
    setResidues,
    Form: analysisResiduesValidator,
    form,
    changeResidue
  };
};
export const AnalysisResiduesForm: FunctionComponent<Props> = ({
  partialAnalysis,
  onBack,
  onValidate,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const {
    residues,
    setResidues,
    Form: _Form,
    form,
    changeResidue
  } = useResiduesForm(partialAnalysis);

  const submit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (inputValidated) => {
      await onValidate(inputValidated.residues);
    });
  };

  const onDeleteResidue = (residueIndex: number) => {
    setResidues(residues.filter((_, i) => i !== residueIndex));
  };

  return (
    <>
      <ToggleSwitch
        label="Des résidus sont-ils identifiés dans ce prélèvement ?"
        checked={residues.length > 0}
        onChange={(checked) => {
          if (checked) {
            setResidues([
              {
                analysisId: partialAnalysis.id,
                residueNumber: 1,
                resultKind: 'Q'
              }
            ]);
          } else {
            setResidues([]);
          }
        }}
        showCheckedHint={false}
        labelPosition="left"
      />
      {residues.length > 0 && (
        <>
          {residues?.map((residue, residueIndex) => (
            <div key={`residue-${residueIndex}`} className="residue-container">
              <AnalysisResidueForm
                changeResidue={changeResidue}
                onDeleteResidue={() => onDeleteResidue(residueIndex)}
                residue={residue}
                residueIndex={residueIndex}
                form={form}
              />
            </div>
          ))}
        </>
      )}
      <hr />
      <div className={cx('fr-grid-row', 'fr-grid-row--gutters')}>
        <div className={cx('fr-col-12')}>
          <ul
            className={cx(
              'fr-btns-group',
              'fr-btns-group--inline-md',
              'fr-btns-group--between',
              'fr-btns-group--icon-left'
            )}
          >
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={[
                  {
                    priority: 'tertiary',
                    onClick: async (e: React.MouseEvent<HTMLElement>) => {
                      e.preventDefault();
                      await onBack();
                    },
                    title: 'Retour',
                    iconId: 'fr-icon-arrow-left-line'
                  }
                ]}
              />
            </li>
            <li>
              <ButtonsGroup
                alignment="left"
                inlineLayoutWhen="md and up"
                buttons={
                  [
                    residues.length > 0
                      ? {
                          children: 'Ajouter un résidu',
                          iconId: 'fr-icon-microscope-fill',
                          priority: 'secondary',
                          onClick: () =>
                            setResidues([
                              ...residues,
                              {
                                analysisId: partialAnalysis.id,
                                residueNumber: residues.length + 1,
                                resultKind: 'Q'
                              }
                            ])
                        }
                      : undefined,
                    {
                      children: 'Continuer',
                      onClick: submit,
                      iconId: 'fr-icon-arrow-right-line',
                      iconPosition: 'right'
                    }
                  ].filter((_) => _ !== undefined) as any
                }
              />
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

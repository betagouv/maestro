import Button from '@codegouvfr/react-dsfr/Button';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import {
  Analysis,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import {
  PartialResidue,
  ResidueLmrCheck
} from 'maestro-shared/schema/Analysis/Residue/Residue';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import React, { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import { useForm } from '../../../../hooks/useForm';
import { ResidueListResult } from '../SampleAnalysisOverview/ResidueListResult';
import { ResiduesSummary } from '../SampleAnalysisOverview/ResiduesSummary';
import { AnalysisComplianceForm } from './AnalysisComplianceForm';
import { ResidueResultForm } from './ResidueResultForm';

type Props = {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
  onDone: () => void;
};

const analysisResiduesValidator = z.object({
  ...Analysis.shape,
  residues: z.array(ResidueLmrCheck)
});

export const SampleAnalysisForm: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  onDone,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [analysis, setAnalysis] = useState<PartialAnalysis>({
    ...partialAnalysis
  });

  const [residues, setResidues] = useState(
    (partialAnalysis.residues ?? []).map((residue) => ({
      ...sample,
      ...residue
    }))
  );

  const changeResidue = (residue: PartialResidue, index: number) => {
    setResidues((r) => {
      const newResidues = [...r];
      newResidues[index] = { ...sample, ...residue };

      return newResidues;
    });
  };

  const form = useForm(analysisResiduesValidator, {
    ...analysis,
    residues
  });

  const addResidue = () => {
    setResidues((r) => {
      const newResidueNumber = r.length
        ? Math.max(...residues.map(({ residueNumber }) => residueNumber)) + 1
        : 1;
      return [
        ...r,
        {
          ...sample,
          analysisId: partialAnalysis.id,
          residueNumber: newResidueNumber,
          resultKind: 'Q',
          result: null
        }
      ];
    });
  };

  const removeResidue = (i: number) => () =>
    setResidues((currentResidues) => {
      return currentResidues.filter((_r, index) => i != index);
    });

  const onSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await form.validate(async (validInput) => {
      console.log(validInput);
    });
  };
  return (
    <>
      {analysis && (
        <>
          <h5 className={clsx('d-flex-align-center', cx('fr-m-0'))}>
            <ResiduesSummary residues={residues ?? []} />
          </h5>

          <ResidueListResult
            residues={residues}
            residuePanel={(i) => (
              <ResidueResultForm
                residue={residues[i]}
                residueIndex={i}
                form={form}
                onDelete={removeResidue(i)}
                onChange={changeResidue}
              />
            )}
            onAddResidue={addResidue}
          />

          <AnalysisComplianceForm
            partialAnalysis={analysis}
            form={form}
            onUpdate={({ compliance, notesOnCompliance }) =>
              setAnalysis((a) => ({ ...a, compliance, notesOnCompliance }))
            }
          />

          <Button
            children="Enregistrer"
            iconId="fr-icon-save-line"
            onClick={onSubmit}
            style={{
              alignSelf: 'center'
            }}
          />
        </>
      )}
    </>
  );
};

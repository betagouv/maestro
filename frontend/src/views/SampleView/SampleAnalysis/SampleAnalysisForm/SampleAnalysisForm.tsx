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
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { z } from 'zod';
import { useForm } from '../../../../hooks/useForm';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueListResult } from '../SampleAnalysisOverview/ResidueListResult';
import { ResiduesSummary } from '../SampleAnalysisOverview/ResiduesSummary';
import { AnalysisComplianceForm } from './AnalysisComplianceForm';
import { ResidueResultForm } from './ResidueResultForm';

type Props = {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
};

const analysisResiduesValidator = z.object({
  ...Analysis.shape,
  residues: z.array(ResidueLmrCheck)
});

type AnalysisResidues = z.infer<typeof analysisResiduesValidator>;
export const SampleAnalysisForm: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [analysis, setAnalysis] = useState({
    partialAnalysis
  });

  const [residues, setResidues] = useState(partialAnalysis.residues ?? []);

  const changeResidue = (residue: PartialResidue, index: number) => {
    setResidues((r) => {
      const newResidues = [...r];
      newResidues[index] = residue;

      return newResidues;
    });
  };

  const form = useForm(analysisResiduesValidator, {
    ...analysis,
    residues: residues.map((residue) => ({
      ...sample,
      ...residue
    }))
  });

  const addResidue = () => {
    setResidues((r) => {
      const newResidueNumber = r.length
        ? Math.max(...residues.map(({ residueNumber }) => residueNumber)) + 1
        : 1;
      return [
        ...r,
        {
          analysisId: partialAnalysis.id,
          residueNumber: newResidueNumber,
          resultKind: 'Q'
        }
      ];
    });
  };

  const removeResidue = (i: number) => () =>
    setResidues((currentResidues) => {
      return currentResidues.filter((_r, index) => i != index);
    });
  return (
    <>
      {analysis && (
        <>
          <AnalysisDocumentPreview
            analysisId={partialAnalysis.id}
            sampleId={sample.id}
            readonly={true}
          />

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

          <AnalysisComplianceForm partialAnalysis={analysis} />
        </>
      )}
    </>
  );
};

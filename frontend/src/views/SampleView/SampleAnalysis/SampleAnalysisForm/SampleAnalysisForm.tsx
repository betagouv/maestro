import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import clsx from 'clsx';
import { PartialAnalysis } from 'maestro-shared/schema/Analysis/Analysis';
import { Sample } from 'maestro-shared/schema/Sample/Sample';
import { FunctionComponent, useState } from 'react';
import { assert, type Equals } from 'tsafe';
import { AnalysisDocumentPreview } from '../../components/AnalysisDocumentPreview';
import { ResidueListResult } from '../SampleAnalysisOverview/ResidueListResult';
import { ResiduesSummary } from '../SampleAnalysisOverview/ResiduesSummary';
import { useResiduesForm } from '../SampleDraftAnalysis/AnalysisResiduesStep/AnalysisResiduesForm';
import { ResidueResultForm } from './ResidueResultForm';

type Props = {
  sample: Sample;
  partialAnalysis: PartialAnalysis;
};
export const SampleAnalysisForm: FunctionComponent<Props> = ({
  sample,
  partialAnalysis,
  ..._rest
}) => {
  assert<Equals<keyof typeof _rest, never>>();

  const [analysis, setAnalysis] = useState(
    PartialAnalysis.parse({
      ...partialAnalysis,
      residues: partialAnalysis.residues ?? []
    })
  );

  const { residues, setResidues, form, changeResidue } = useResiduesForm(
    partialAnalysis,
    sample
  );

  const addResidue = () =>
    setResidues((currentResidues) => {
      const newResidueNumber = currentResidues.length
        ? Math.max(
            ...currentResidues.map(({ residueNumber }) => residueNumber)
          ) + 1
        : 1;
      return [
        ...currentResidues,
        {
          analysisId: partialAnalysis.id,
          residueNumber: newResidueNumber,
          resultKind: 'Q'
        }
      ];
    });

  const removeResidue = (i: number) => () =>
    setResidues((currentResidues) => {
      return currentResidues.filter((_r, index) => i != index);
    });
  return (
    <>
      {analysis && (
        <>
          <AnalysisDocumentPreview
            analysisId={analysis.id}
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

          <div>TODO</div>
        </>
      )}
    </>
  );
};
